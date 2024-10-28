require("dotenv").config()
const Discord= require("discord.js")
const {exec} = require("better-sqlite3/lib/methods/wrappers");
const database = require("better-sqlite3")('D:\\discord-bot\\src\\databanks\\test.db')
const ranked =  require("./ranked.js")
const bot = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMembers,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.MessageContent
    ],

})
let prefix = "!"
let respondToKeywords = true
let statuses = [
    "The One Piece is real!",
    "Nah, I'd win",
    "Stand proud. You're strong.",
    "So its the same type of stand as Star Platinum",
    "Ah yes, the random bullshit go technique I didn't use since the Heian Era",
    "Ah yes, the anti-social technique I haven't used since yesterday",
    "did i piss myself or is that just the drip.",
    "I smoke real Amrani rapscallion ghost nuggets, y'all can't fuck with me. ~Dracula",
    "They must have amnesia. They forgot I'm him.",
    "I hope them aliens are real so I have more to fuck",
    "Hey you want something random? Try to guess what happens I dare you https://youtube.com/shorts/SzHx-d7N0Bg?si=D8Js8Z5_XI2YeKWl",
    "Yes, I am!",
    "Pizza Mozza- rella!",
    "OK Masta let's kill da ho! BEEEEEEEETCH!",
    "Never give up on gambling 🔥🔥🔥",
    "99% of people quit gambling right before the jackpot!",
    "You know what, all of you better duck. Because I'm about to turn left and I don't wanna smack you with my dick.",
    "What I understand is I am going to pound you so hard the boys' mother is going to be jealous.",
    "Huh, this is a new feeling. Pride in someone else. Unfortunately, its overshadowed by all this unyielding rage!",
    "Skibidi Toilet",
    "Why do I always have to drink water only to piss it out again? This place is a prison.",
    "Nuke the french (sorry Auro)",
    "Heavens door, remove his ability to cum!"
]
function createRankedTables(serverName){
    let tableName = "matches_" + serverName
    let sql = "CREATE TABLE IF NOT EXISTS " + tableName + "(id integer, first_player varchar, second_player varchar, score_first_player integer, score_second_player integer, winner varchar, date integer default current_timestamp)"
    database.exec(sql)
    tableName = "player_stats_" + serverName
    sql = "CREATE TABLE IF NOT EXISTS " + tableName + "(player_name varchar, current_rating integer, max_rating integer, min_rating integer, total_matches integer,wins integer, losses integer, won_games integer, lost_games integer, current_streak integer, best_streak integer)"
    database.exec(sql)
}

function getTableCount(tableName) {
    let sql = "SELECT * FROM " + tableName
    return database.prepare(sql).all().length + 1 // + 1 because we want to get the next match. Dont ask me why I didn't add it in the relevant spot though
}
function addResultToDatabase(matchResult, serverID) {
    if (matchResult.length !== 4){
        return "Seems like you didn't add enough parameters!"
    }
    if (!(matchResult[1].startsWith("<@")) || !(matchResult[2].startsWith("<@"))) {
        return "You have to enter two discord accounts, you dummy!"
    }
    if (matchResult[1] === matchResult[2]) {
        return "You have to enter two **different** discord accounts, silly. :3"
    }
    if (!matchResult[3].includes("-") && !matchResult[3].includes(":")) {
        return "It seems like the result was not entered properly. Please try again"
    }
    let firstPlayer = matchResult[1]
    let secondPlayer = matchResult[2]
    let scoreFirstPlayer
    let scoreSecondPlayer
    if (matchResult[3].includes("-")) {
        matchResult[3] = matchResult[3].split("-")
        scoreFirstPlayer = matchResult[3][0]
        scoreSecondPlayer = matchResult[3][1]
    } else {
        matchResult[3] = matchResult[3].split(":")
        scoreFirstPlayer = matchResult[3][0]
        scoreSecondPlayer = matchResult[3][1]
    }
    let winner = +scoreFirstPlayer < +scoreSecondPlayer ? secondPlayer : +scoreFirstPlayer > +scoreSecondPlayer ? firstPlayer : "Tie"
    let tableName = "matches_" + serverID
    let sql = "INSERT INTO " + tableName + "(id,first_player,second_player,score_first_player,score_second_player,winner) VALUES (?,?,?,?,?,?)"
    database.prepare(sql).run(getTableCount(tableName), matchResult[1], matchResult[2], scoreFirstPlayer, scoreSecondPlayer, winner)
    updateStatsDatabase(firstPlayer, secondPlayer, scoreFirstPlayer, scoreSecondPlayer, serverID)
    return "The match has been added to the database!"
}
function getNewStats(player, opponent, playerScore, opponentScore){
    let expectationValuePlayer = 10 ** (player["current_rating"]/400) / (10 ** (player["current_rating"]/400) + 10 ** (opponent["current_rating"]/400))

    let resultPlayer = (playerScore > opponentScore ? 1 : playerScore < opponentScore ? 0 : 0.5)

    let newRating = player["current_rating"] + 50 * (resultPlayer - expectationValuePlayer)

    let newStreak = (currentStreak, isWin) => {
        if (isWin < 0) {
            return Math.min(currentStreak - 1, -1)
        } else if (isWin > 0) {
            return Math.max(currentStreak + 1, 1)
        } else {
            return currentStreak
        }
    }

    let newishStreak = newStreak(player["current_streak"], playerScore - opponentScore)

    return {
        "current_rating":   newRating,
        "max_rating":       Math.max(player["max_rating"], newRating),
        "min_rating":       Math.min(player["min_rating"], newRating),
        "total_matches":    player["total_matches"] + 1,
        "wins":             player["wins"] + (playerScore > opponentScore ? 1 : 0),
        "losses":           player["losses"] + (playerScore < opponentScore ? 1 : 0),
        "won_games":        +player["won_games"] + +playerScore,
        "lost_games":       +player["lost_games"] + +opponentScore,
        "current_streak":   newishStreak,
        "best_streak":      Math.max(newishStreak, player["best_streak"])
    }
}
function createPlayerEntry(player, serverID){
    let tableName = "player_stats_" + serverID
    let sql = "INSERT INTO " + tableName + " VALUES(?,?,?,?,?,?,?,?,?,?,?)"
    database.prepare(sql).run(player,500,500,500,0,0,0,0,0,0,0)
    sql = "SELECT * FROM " + tableName + " WHERE player_name = ?"
    return database.prepare(sql).get(player)
}
function updateStatsDatabase(firstPlayer, secondPlayer, firstPlayerScore, secondPlayerScore, serverID = "") {
    let tableName = "player_stats_" + serverID
    let sql = "SELECT * FROM " + tableName + " WHERE player_name = ?"
    let firstPlayerStats = database.prepare(sql).get(firstPlayer) ?? createPlayerEntry(firstPlayer, serverID)
    let secondPlayerStats = database.prepare(sql).get(secondPlayer) ?? createPlayerEntry(secondPlayer, serverID)
    let newFirstStat = getNewStats(firstPlayerStats, secondPlayerStats, firstPlayerScore, secondPlayerScore)
    let newSecondStat = getNewStats(secondPlayerStats, firstPlayerStats, secondPlayerScore, firstPlayerScore)
    sql = "UPDATE " + tableName + " SET current_rating = ?, max_rating = ?, min_rating = ?, total_matches = ?, wins = ?, losses = ?, won_games = ?, lost_games = ?, current_streak = ?, best_streak = ? WHERE player_name = ?"
    database.prepare(sql).run(
        newFirstStat["current_rating"],
        newFirstStat["max_rating"],
        newFirstStat["min_rating"],
        newFirstStat["total_matches"],
        newFirstStat["wins"],
        newFirstStat["losses"],
        newFirstStat["won_games"],
        newFirstStat["lost_games"],
        newFirstStat["current_streak"],
        newFirstStat["best_streak"],
        firstPlayer
    )
    database.prepare(sql).run(
        newSecondStat["current_rating"],
        newSecondStat["max_rating"],
        newSecondStat["min_rating"],
        newSecondStat["total_matches"],
        newSecondStat["wins"],
        newSecondStat["losses"],
        newSecondStat["won_games"],
        newSecondStat["lost_games"],
        newSecondStat["current_streak"],
        newSecondStat["best_streak"],
        secondPlayer
    )

}
function queryPlayerStats(player){

}
function doesDatabaseExist(tableName) {
    let sql = "SELECT count(*) FROM sqlite_master WHERE type='table' AND name=" + "'matches_" + tableName + "'"
    return database.exec(sql) !== 0
}

bot.on("ready", (c) => {
    console.log(c.user.tag.split("#")[0] + " is ready uwu")
    setInterval(() => {
        let randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        bot.user.setActivity({
            name: randomStatus,
            type: Discord.ActivityType.Custom
        });
    }, 60000);
})

bot.on("messageCreate", (message) => {
    if(respondToKeywords) {
        if(message.content.includes("Bingo")) {
            message.reply({files: [{attachment: "assets\\gojo-bingo.gif", name: "getBingoed.gif"}]})
        }
        if(message.content.includes("cock")) {
            message.reply({files: [{attachment: "assets\\cockbending.png", name: "cockbending.jpg"}]})
        }
        if(message.content.includes("prince of all saiyans")) {
            message.reply({files: [{attachment: "assets\\princeofallsaiyans.mp4", name: "video.mp4"}]})
        }
    }
    if(message.content.startsWith(prefix)) {

        message.content = message.content.substring(1)
    }
    /*
     * basic functionality
     */
    if(message.content === "reactions") {
        respondToKeywords = !respondToKeywords
        message.reply("T-The reactions are turned to " + respondToKeywords.toString() + "!")
    }
    if(message.content.startsWith("changePrefix")) {
        let parts = message.content.split(" ")
        if(!parts[1]) {
            message.reply("P-Please enter a symbol...")
        } else if(parts[1].length > 2) {
            message.reply("T-The prefix cant be longer than two characters..")
        } else {
            prefix = parts[1]
            message.reply("T-The prefix was successfully changed!!")
        }
    }
    /*
     * ranked
     */
    if(message.content === "matches") {
        // get this shit in its own function
        let sql = "SELECT * FROM matches"
        let replyMatchHistory = ""
        database.prepare(sql).all().forEach((row) => {
            replyMatchHistory += row["first_player"] + " " + row["score_first_player"] + "-" + row["score_second_player"] + " " + row["second_player"] + "\n"
        })
        message.reply(replyMatchHistory || "no matches available")
    }
    if(message.content.startsWith("result")) {
        try {
            message.reply(addResultToDatabase(message.content.split(" "), message.guildId.toString()))
        } catch (exception) {
            console.log(exception.message)
            message.reply("Oops, im sorry, something went wrong!")
        }
    }
    if(message.content.startsWith("stats")) {
        let messageArguments = message.content.split(" ")
        message.reply("lmao")
    }
    if(message.content === "createRankedTable") {
        if(doesDatabaseExist(message.guildId)) {
            createRankedTables(message.guildId)
            message.reply("The ranked database has been set up!")
        } else {
            message.reply("The ranked database is already set up.")
        }
    }
    /*
     * debug
     */
    if(message.content.startsWith("message")) {
        const channel = bot.channels.cache.get(message.channelId)
        const exampleEmbed = new Discord.EmbedBuilder()
            .setColor(0xE8A7A1)
            .setTitle('Some title')
            .setDescription('Some description here')
            .setThumbnail('https://i.imgur.com/AfFp7pu.png')
            .addFields(
                { name: 'Regular field title', value: 'Some value here' },
                { name: '\u200B', value: '\u200B' },
                { name: 'Inline field title', value: 'Some value here', inline: true },
                { name: 'Inline field title', value: 'Some value here', inline: true },
            )
            .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
            .setImage('https://i.imgur.com/AfFp7pu.png')
            .setTimestamp()
            .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
        channel.send("This is the " + channel.name + " channel")
        channel.send({embeds: [exampleEmbed]})
    }
})
bot.login(
    process.env.DISCORD_BOT_KEY
)