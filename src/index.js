require("dotenv").config()
const db = require("./database.js")
const Discord = require("discord.js")
const {
    createReactionsEntry, isReactionActivated, updateReactionActivation, updateServerReactionActivation
} = require("./database");
const bot = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMembers,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.MessageContent,
        Discord.IntentsBitField.Flags.GuildMessageReactions,
        Discord.IntentsBitField.Flags.DirectMessageReactions
    ],
})
// create prefix database for changeability
let prefix = "!"
let queue = {}
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
let commandsHelp = {
    general: {
        avatar: {
            name: "avatar",
            description: "Gets the profile picture of a user. \nUsage: !avatar [Discord Tag]",
            permissions: "user"
        },
        reactions: {
            name: "reactions",
            description: "Toggles BOTcchis reaction memes to keywords. \nUsage: !reactions { optional: 'server' }",
            permissions: "admin"
        },
        help: {
            name: "help",
            description: "Sends the user a command list to use. \nUsage: !help { optional: 'general', 'ranked' }",
            permissions: "user"
        },
    },
    ranked: {
        createRankedTable: {
            name: "createRankedTable",
            description: "Creates the prerequisite ranked tables for your server. \nUsage: !createRankedTable",
            permissions: "admin"
        },
        result: {
            name: "result",
            description: "Adds a result between two players to the ranked database. \nUsage: !result [Discord Tag] [Discord Tag] [Score P1 - Score P2]",
            permissions: "admin"
        },
        matches: {
            name: "matches",
            description: "Returns the last matches played on this server. \nUsage: !matches { optional: number, default: 5 }",
            permissions: "user"
        },
        stats: {
            name: "stats",
            description: "Returns the stats of the user or the tagged person. \nUsage: !stats { optional: Discord Tag, default: user }",
            permissions: "user"
        },
        queue: {
            name: "queue",
            description: "Matchmaking queue with the help of BOTcchi. \nUsage: !queue [ 'join { optional: join message }', 'match [Discord Tag]', 'leave', 'check' ]",
            permissions: "user"
        },
    }
}

async function getChannelIds() {
    const discordServers = bot.guilds.cache;
    let channels = discordServers.map(discordServer => discordServer.channels.cache)
    channels = channels.map(guild => guild.map(channel => [channel.id, channel.guildId])).flat()
    return channels
}

function isAdmin(msg) {
    try {
        return msg.member.permissionsIn(msg.channel).has(Discord.PermissionsBitField.Flags.Administrator)
    } catch {
        return false
    }
}

function buildHelpPage(message, value, key) {
    let page = new Discord.EmbedBuilder()
        .setTitle(`Commands: ${key}`)
        .setColor(0xE8A7A1)
        .setThumbnail(message.guild.iconURL())
        .setTimestamp()
    for (const [innerKey, innerValue] of Object.entries(value)) {
        if (isAdmin(message) || innerValue.permissions !== "admin") {
            page.addFields({
                name: innerValue.name,
                value: innerValue.description
            })
        }
    }
    return page
}

bot.on("ready", (c) => {
    console.log(c.user.tag.split("#")[0] + " is ready uwu")
    getChannelIds().then(channels => channels.forEach(channel => createReactionsEntry(channel[0], channel[1])))
    setInterval(() => {
        let randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        bot.user.setActivity({
            name: randomStatus,
            type: Discord.ActivityType.Custom
        });
    }, 5 * 60 * 1000);
})

bot.on("guildCreate", (c) => {
    console.log("Joined " + c.name)
    getChannelIds().then(channels => channels.forEach(channel => createReactionsEntry(channel[0], channel[1])))
})

bot.on("channelCreate", (c) => {
    console.log("New channel was created: " + c.guild.name, c.name)
    createReactionsEntry(c.id, c.guildId)
})

bot.on("messageCreate", async (message) => {
    try {
        if (message.author.bot) {
            return
        }
        let response = isReactionActivated(message.channelId)
        if (response) {
            if (message.content.includes("Bingo")) {
                message.reply({files: [{attachment: "assets/gojo-bingo.gif", name: "getBingoed.gif"}]})
            }
            if (message.content.includes("cock")) {
                message.reply({files: [{attachment: "assets/cockbending.png", name: "cockbending.jpg"}]})
            }
            if (message.content.includes("prince of all saiyans")) {
                message.reply({files: [{attachment: "assets/princeofallsaiyans.mp4", name: "video.mp4"}]})
            }
            if (message.content.toLowerCase().includes("awesome fucking tien edit")) {
                message.reply({files: [{attachment: "assets/coolTienEdit.mp4", name: "video.mp4"}]})
            }
            if (message.content.includes("goku")) {
                let image = [
                    "assets/gokucircles/7fe.jpg",
                    "assets/gokucircles/9c9.jpg",
                    "assets/gokucircles/img.png",
                    "assets/gokucircles/img_1.png",
                    "assets/gokucircles/niko-from-dragon-ball-z-v0-vemp5dgmo73e1.webp",
                ]
                message.reply({
                    files: [{
                        attachment: image[Math.floor(Math.random() * image.length)],
                        name: "image.png"
                    }]
                })
            }
            if (message.content.includes("the drink")) {
                let clip = [
                    "assets/thedrink/the_cup.mov",
                    "assets/thedrink/they_call_him_the_what.mov",
                    "assets/thedrink/u_think.mov",
                    "assets/thedrink/the_cup.mov",
                ]
                message.reply({files: [{attachment: clip[Math.floor(Math.random() * clip.length)], name: "video.mp4"}]})
            }
        }
        if (message.content.startsWith(prefix)) {
            message.content = message.content.substring(1)
        }
        /*
         * basic functionality
         */
        if (message.content === "reactions") {
            if (!isAdmin(message)) {
                return
            }
            response = !response
            updateReactionActivation(message.channelId, response)
            message.reply("T-The reactions are turned to " + response.toString() + "!")
        }
        if (message.content === "reactions server") {
            if (!isAdmin(message)) {
                return
            }
            response = !response
            updateServerReactionActivation(message.guildId, response)
            message.reply("T-The reactions for the whole server are turned to " + response.toString() + "!")
        }
        // TO DO: add table for server prefix
        // if (message.content.startsWith("changePrefix")) {
        //     if(!isAdmin(message)) {return}
        //     let parts = message.content.split(" ")
        //     if (!parts[1]) {
        //         message.reply("P-Please enter a symbol...")
        //     } else if (parts[1].length > 2) {
        //         message.reply("T-The prefix cant be longer than two characters..")
        //     } else {
        //         prefix = parts[1]
        //         message.reply("T-The prefix was successfully changed!!")
        //     }
        // }
        if (message.content.startsWith("avatar")) {
            let userID = message.content.split(" ")[1].slice(2, -1)
            let user = await bot.users.fetch(userID).then((user) => user.displayAvatarURL({size: 4096}))
            await message.reply(user)
        }
        if (message.content.startsWith("help")) {
            let parameter = message.content.substring(4).trim()
            let embed = []
            for (const [key, value] of Object.entries(commandsHelp)) {
                if (!parameter || parameter.toLowerCase() === "here" || key === parameter ) {
                    embed.push(buildHelpPage(message, value, key))
                }
            }
            if (embed.length !== 0 && parameter.toLowerCase() !== "here") {
                await message.react("✅")
                await message.author.send({embeds: embed})
            } else if (embed.length !== 0) {
                await message.channel.send({embeds: embed})
            } else {
                await message.reply("Thats not a valid category")
            }
        }
        /*
         * ranked
         */
        if (message.content.startsWith("result")) {
            if (!isAdmin(message)) {
                return
            }
            let matchResult = message.content.split(" ")
            if (matchResult.length !== 4) {
                await message.reply("Seems like you didn't add enough parameters!")
                return
            }
            if (!matchResult[1].startsWith("<@") || !matchResult[2].startsWith("<@")) {
                await message.reply("You have to enter two discord accounts, you dummy!")
                return
            }
            if (matchResult[1] === matchResult[2]) {
                await message.reply("You have to enter two **different** discord accounts, silly. :3")
                return
            }
            if (!matchResult[3].includes("-") && !matchResult[3].includes(":")) {
                await message.reply("It seems like the result was not entered properly. Please try again")
                return
            }
            let [firstPlayer, firstPlayerRating] = [await bot.users.fetch(matchResult[1].slice(2, -1)), db.getPlayerStats(message.guildId, matchResult[1])["current_rating"]]
            let [secondPlayer, secondPlayerRating] = [await bot.users.fetch(matchResult[2].slice(2, -1)), db.getPlayerStats(message.guildId, matchResult[2])["current_rating"]]
            let isError = db.addResultToDatabase(matchResult, message.guildId.toString())
            let firstPlayerRatingAfter = db.getPlayerStats(message.guildId, matchResult[1])
            let secondPlayerRatingAfter = db.getPlayerStats(message.guildId, matchResult[2])
            let firstPlayerDifference = Math.round(firstPlayerRatingAfter.current_rating) - Math.round(firstPlayerRating)
            let secondPlayerDifference = Math.round(secondPlayerRatingAfter.current_rating) - Math.round(secondPlayerRating)
            if (isError) {
                await message.reply("Oops, im sorry, something went wrong!")
                return
            }
            let result = matchResult[3].split(/[-:]/)
            let embed = new Discord.EmbedBuilder()
                .setColor(0xE8A7A1)
                .setTitle('Match Result')
                .setThumbnail(message.guild.iconURL())
                .setTimestamp()
                .addFields({
                    name: firstPlayer.globalName + " -> " + matchResult[3] + " <- " + secondPlayer.globalName,
                    value: '\u200b'
                })
            if (result[0] !== result[1]) {
                embed.addFields({
                    name: (result[0] < result[1] ? secondPlayer.globalName : firstPlayer.globalName) + ` is on a ${firstPlayerRatingAfter.current_streak === 0 ? secondPlayerRatingAfter.current_streak : firstPlayerRatingAfter.current_streak} game winning streak!`,
                    value: '\u200b'
                })
            }
            embed.addFields({
                name: firstPlayer.globalName,
                value: Math.round(firstPlayerRating) + (firstPlayerDifference > 0 ? " + " : " - ") + Math.abs(firstPlayerDifference) + " :arrow_right: " + Math.round(firstPlayerRatingAfter.current_rating),
                inline: true
            })
            embed.addFields({
                name: secondPlayer.globalName,
                value: Math.round(secondPlayerRating) + (secondPlayerDifference > 0 ? " + " : " - ") + Math.abs(secondPlayerDifference) + " :arrow_right: " + Math.round(secondPlayerRatingAfter.current_rating),
                inline: true
            })
            await message.reply({embeds: [embed]})
        }
        if (message.content === "createRankedTable") {
            if (!isAdmin(message)) {
                return
            }
            if (db.doesDatabaseExist(message.guildId)) {
                db.createRankedTables(message.guildId)
                await message.reply("The ranked database has been set up!")
            } else {
                await message.reply("The ranked database is already set up.")
            }
        }
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
        if (message.content.startsWith("stats")) {
            let messageArguments = message.content.split(" ")
            // need to check if message argument is a discord user or not
            let playerID = messageArguments.length === 1 ? "<@" + message.author.id + ">" : messageArguments[1]
            let player = await bot.users.fetch(playerID.slice(2, -1)).then(player => player.avatarURL())
            let playerStats = db.getPlayerStats(message.guildId.toString(), playerID)
            let embed = new Discord.EmbedBuilder()
                .setColor(0xE8A7A1)
                .setTitle('Player Stats')
                .setDescription('User: ' + message.author.globalName)
                .setThumbnail(player)
                .setTimestamp()
                .addFields({
                    name: "Match Rating", value: Math.round(playerStats["current_rating"]).toString(), inline: true
                }, {
                    name: "Highest MR", value: Math.round(playerStats["max_rating"]).toString(), inline: true
                }, {
                    name: "Lowest MR", value: Math.round(playerStats["min_rating"]).toString(), inline: true
                }, {
                    name: "Victories", value: playerStats["wins"].toString(), inline: true
                }, {
                    name: "Defeats", value: playerStats["losses"].toString(), inline: true
                }, {
                    name: "Winrate",
                    value: Math.round((+playerStats["wins"] / +playerStats["total_matches"]) * 100) + " %",
                    inline: true
                }, {
                    name: "Rounds won", value: playerStats["won_games"].toString(), inline: true
                }, {
                    name: "Rounds lost", value: playerStats["lost_games"].toString(), inline: true
                }, {
                    name: "Round winrate",
                    value: Math.round((+playerStats["won_games"] / (+playerStats["won_games"] + +playerStats["lost_games"])) * 100) + " %",
                    inline: true
                }, {
                    name: "Total games",
                    value: (+playerStats["won_games"] + +playerStats["lost_games"]).toString(),
                    inline: true
                }, {
                    name: "Streak", value: playerStats["current_streak"].toString(), inline: true
                }, {
                    name: "Highest streak", value: playerStats["best_streak"].toString(), inline: true
                },)

            await message.reply({embeds: [embed]})
        }
        if (message.content.startsWith("queue join")) {
            if (!queue[message.guildId]) {
                queue[message.guildId] = []
            }
            let player = {
                name: message.author,
                message: message.content.substring(10)
            }
            let joinedPlayers = queue[message.guildId].map((player) => player.name)
            if (!joinedPlayers.includes(player.name)) {
                queue[message.guildId].push(player)
                await message.react("✅")
            } else {
                await message.reply("You cant join the queue twice")
            }
        }
        if (message.content === "queue check") {
            if (!queue[message.guildId]) {
                queue[message.guildId] = []
            }
            let embeds = []
            if (queue[message.guildId].length === 0) {
                embeds = [
                    new Discord.EmbedBuilder()
                        .setColor(0xE8A7A1)
                        .setTitle('Matchmaking Queue')
                        .setThumbnail(message.guild.iconURL())
                        .setTimestamp()
                        .addFields({
                            name: "No one joined the queue",
                            value: "Join the queue by typing '!queue join'!"
                        })
                ]
            } else {
                embeds = queue[message.guildId].map((player) => new Discord.EmbedBuilder()
                    .setColor(0xE8A7A1)
                    .setTitle('Matchmaking Queue')
                    .setThumbnail(message.guild.iconURL())
                    .setTimestamp()
                    .addFields({
                        name: "Player:", value: "<@" + player.name.id + ">", inline: true
                    }, {
                        name: "Message:", value: player.message ? player.message : "\u200b", inline: true
                    }))
            }
            await message.reply({embeds: [...embeds]})
        }
        if (message.content.startsWith("queue match")) {
            if (!queue[message.guildId]) {
                queue[message.guildId] = []
            }
            let joinedPlayers = queue[message.guildId].map((player) => player.name)
            let player

            try {
                player = await bot.users.fetch(message.content.substring(11).trim().slice(2, -1))
            } catch {
                player = null
            }
            if (player === message.author) {
                await message.reply("You can't join yourself in matchmaking.")
            } else if (!joinedPlayers.includes(player)) {
                await message.reply("That player is not currently in the Matchmaking queue")
            } else {
                let reply = await player.send(message.author.displayName + " has sent you a match request. Do you want to accept?")
                await reply.react("✅")
                await reply.react("❌")
                const filter = (reaction) => {
                    return reaction.emoji.name === "✅" || reaction.emoji.name === "❌"
                }
                const collector = reply.createReactionCollector({filter, max: 1});
                collector.on('collect', r => {
                    if (r.emoji.name === "✅") {
                        message.author.send(`${player.displayName} accepted your match request. Send them a DM to make the match happen.`)
                        queue[message.guildId] = queue[message.guildId].filter((queue) => queue !== player)

                    } else {
                        message.author.send(`${player.displayName} did not accept your match request.`)
                    }
                })
            }
        }
        if (message.content === "queue leave") {
            if (!queue[message.guildId]) {
                queue[message.guildId] = []
            }
            let joinedPlayers = queue[message.guildId].map((player) => player.name)
            if (joinedPlayers.includes(message.author)) {
                queue[message.guildId] = queue[message.guildId].filter((player) => player.name !== message.author)
                await message.react("✅")
            } else {
                await message.reply("You aren't in the queue")
            }
        }
        /*
         * debug
         */
        if (message.content.startsWith("message")) {
            const channel = bot.channels.cache.get(message.channelId)
            await channel.send("<@" + message.author.id + ">")
            console.log(message.author.id)
        }
    } catch (e) {
        console.log(e)
        message.reply("Oops, seems like I caught an error.")
    }
})
bot.login(process.env.DISCORD_BOT_KEY)