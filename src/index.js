require("dotenv").config()
const db = require("./database.js")
const Discord= require("discord.js")
const bot = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMembers,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.MessageContent
    ],

})
// create prefix database for changeability
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
    "Heavens door, remove his ability to cum!",
    "Check out my perfect form. It's perfect!",
    "A beverage of sorts?"
]

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

bot.on("guildCreate", (c) => {
    console.log("Joined " + c.name)
})

bot.on("messageCreate", async (message) => {
    // only going to add it back once I got the functionality down

    // if(respondToKeywords) {
    //     if(message.content.includes("Bingo")) {
    //         message.reply({files: [{attachment: "assets\\gojo-bingo.gif", name: "getBingoed.gif"}]})
    //     }
    //     if(message.content.includes("cock")) {
    //         message.reply({files: [{attachment: "assets\\cockbending.png", name: "cockbending.jpg"}]})
    //     }
    //     if(message.content.includes("prince of all saiyans")) {
    //         message.reply({files: [{attachment: "assets\\princeofallsaiyans.mp4", name: "video.mp4"}]})
    //     }
    //     if(message.content.includes("awesome fucking tien edit")) {
    //         message.reply({files: [{attachment: "assets\\coolTienEdit.mp4", name: "video.mp4"}]})
    //     }
    // }
    if (message.content.startsWith(prefix)) {

        message.content = message.content.substring(1)
    }
    /*
     * basic functionality
     */
    if (message.content === "reactions") {
        respondToKeywords = !respondToKeywords
        message.reply("T-The reactions are turned to " + respondToKeywords.toString() + "!")
    }
    if (message.content.startsWith("changePrefix")) {
        let parts = message.content.split(" ")
        if (!parts[1]) {
            message.reply("P-Please enter a symbol...")
        } else if (parts[1].length > 2) {
            message.reply("T-The prefix cant be longer than two characters..")
        } else {
            prefix = parts[1]
            message.reply("T-The prefix was successfully changed!!")
        }
    }
    /*
     * ranked
     */

    // TO DO: person specific query
    if (message.content.startsWith("matches")) {
        let messageInfo = message.content.split(" ")
        let entries = messageInfo.length === 1 ? 5 : messageInfo[1]
        const matchHistory = db.getMatchHistory(message.guildId.toString(), entries)
        let embed = []
        for (let i = 0; i < matchHistory.length; i++) {
            let page = Math.floor(i / 25)
            if (i % 25 === 0) {
                embed[page] = new Discord.EmbedBuilder()
                    .setColor(0xE8A7A1)
                    .setTitle('Match History')
                    .setDescription('Last ' + matchHistory.length + ' matches')
                    .setThumbnail(message.guild.iconURL())
                    .setTimestamp()
            }
            let entry = matchHistory[i]
            embed[page].addFields({
                name: "Match " + entry["id"],
                value: entry["first_player"] + " " + entry["score_first_player"] + " - " + entry["score_second_player"] + " " + entry["second_player"]
            })
        }
        await message.reply({embeds: [...embed]})

    }
    if (message.content.startsWith("result")) {
        let matchResult = message.content.split(" ")
        let reply = matchResult.length !== 4 ? "Seems like you didn't add enough parameters!" :
            !(matchResult[1].startsWith("<@")) || !(matchResult[2].startsWith("<@")) ? "You have to enter two discord accounts, you dummy!" :
                (matchResult[1] === matchResult[2]) ? "You have to enter two **different** discord accounts, silly. :3" :
                    !matchResult[3].includes("-") && !matchResult[3].includes(":") ? "It seems like the result was not entered properly. Please try again" :
                        "The match has been added to the database!"
        try {
            db.addResultToDatabase(matchResult, message.guildId.toString())
            await message.reply(reply)
        } catch (exception) {
            console.log(exception.message)
            await message.reply("Oops, im sorry, something went wrong!")
        }
    }
    if (message.content.startsWith("stats")) {
        let messageArguments = message.content.split(" ")
        // need to check if message argument is a discord user or not
        let playerID = messageArguments.length === 1 ? "<@" + message.author.id + ">" : messageArguments[1]
        let player = bot.users.fetch(playerID.slice(2, -1)).then(player => player.avatarURL())
        let playerStats = db.getPlayerStats(message.guildId.toString(), playerID)
        let embed = new Discord.EmbedBuilder()
            .setColor(0xE8A7A1)
            .setTitle('Player Stats')
            .setDescription('User: ' + message.author.globalName)
            .setThumbnail(await player)
            .setTimestamp()
            .addFields(
                {
                    name: "Match Rating",
                    value: Math.round(playerStats["current_rating"]).toString(),
                    inline: true
                },
                {
                    name: "Highest MR",
                    value: Math.round(playerStats["max_rating"]).toString(),
                    inline: true
                },
                {
                    name: "Lowest MR",
                    value: Math.round(playerStats["min_rating"]).toString(),
                    inline: true
                },
                {
                    name: "Victories",
                    value: playerStats["wins"].toString(),
                    inline: true
                },
                {
                    name: "Defeats",
                    value: playerStats["losses"].toString(),
                    inline: true
                },
                {
                    name: "Winrate",
                    value: Math.round((+playerStats["wins"] / +playerStats["total_matches"]) * 100) + " %",
                    inline: true
                },
                {
                    name: "Rounds won",
                    value: playerStats["won_games"].toString(),
                    inline: true
                },
                {
                    name: "Rounds lost",
                    value: playerStats["lost_games"].toString(),
                    inline: true
                },
                {
                    name: "Round winrate",
                    value: Math.round((+playerStats["won_games"] / (+playerStats["won_games"] + +playerStats["lost_games"])) * 100) + " %",
                    inline: true
                },
                {
                    name: "Total games",
                    value: (+playerStats["won_games"] + +playerStats["lost_games"]).toString(),
                    inline: true
                },
                {
                    name: "Streak",
                    value: playerStats["current_streak"].toString(),
                    inline: true
                },
                {
                    name: "Highest streak",
                    value: playerStats["best_streak"].toString(),
                    inline: true
                },)

        await message.reply({embeds: [embed]})
    }
    if (message.content === "createRankedTable") {
        if (db.doesDatabaseExist(message.guildId)) {
            db.createRankedTables(message.guildId)
            await message.reply("The ranked database has been set up!")
        } else {
            await message.reply("The ranked database is already set up.")
        }
    }
    /*
     * debug
     */
    if (message.content.startsWith("message")) {
        const channel = bot.channels.cache.get(message.channelId)
        // const exampleEmbed = new Discord.EmbedBuilder()
        //     .setColor(0xE8A7A1)
        //     .setTitle('Some title')
        //     .setDescription('Some description here')
        //     .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        //     .addFields(
        //         {name: 'Regular field title', value: 'Some value here'},
        //         {name: '\u200B', value: '\u200B'},
        //         {name: 'Inline field title', value: 'Some value here', inline: true},
        //         {name: 'Inline field title', value: 'Some value here', inline: true},
        //     )
        //     .addFields({name: 'Inline field title', value: 'Some value here', inline: true})
        //     .setImage('https://i.imgur.com/AfFp7pu.png')
        //     .setTimestamp()
        //     .setFooter({text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png'});
        // channel.send("This is the " + channel.name + " channel")
        await channel.send("<@" + message.author.id + ">")
        console.log(message.author.id)
    }
})
bot.login(
    process.env.DISCORD_BOT_KEY
)