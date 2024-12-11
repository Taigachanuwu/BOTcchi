const Discord = require("discord.js");
let queue = {}

module.exports = {
    name: "queue",
    description: "Matchmaking queue with the help of BOTcchi. \nUsage: !queue [ 'join { optional: join message }', 'match [Discord Tag]', 'leave', 'check' ]",
    permissions: "user",
    category: "ranked",
    async execute(interaction, args, bot) {
        if (args.length === 0) {
            interaction.reply("Possible arguments: join, check, match, leave")
            return
        }
        let joinedPlayers
        switch (args[0].toLowerCase()) {
            case "join":
                if (!queue[interaction.guildId]) {
                    queue[interaction.guildId] = []
                }
                let playerJSON = {
                    name: interaction.author,
                    message: interaction.content.substring(12)
                }
                joinedPlayers = queue[interaction.guildId].map((player) => player.name)
                if (!joinedPlayers.includes(playerJSON.name)) {
                    queue[interaction.guildId].push(playerJSON)
                    await interaction.react("✅")
                } else {
                    await interaction.reply("You cant join the queue twice")
                }
                break
            case "check":
                if (!queue[interaction.guildId]) {
                    queue[interaction.guildId] = []
                }
                let embeds
                if (queue[interaction.guildId].length === 0) {
                    embeds = [
                        new Discord.EmbedBuilder()
                            .setColor(0xE8A7A1)
                            .setTitle('Matchmaking Queue')
                            .setThumbnail(interaction.guild.iconURL())
                            .setTimestamp()
                            .addFields({
                                name: "No one joined the queue",
                                value: "Join the queue by typing '!queue join'!"
                            })
                    ]
                } else {
                    console.log(queue)
                    embeds = queue[interaction.guildId].map((player) => new Discord.EmbedBuilder()
                        .setColor(0xE8A7A1)
                        .setTitle('Matchmaking Queue')
                        .setThumbnail(interaction.guild.iconURL())
                        .setTimestamp()
                        .addFields({
                            name: "Player:", value: "<@" + player.name.id + ">", inline: true
                        }, {
                            name: "Message:", value: player.message ? player.message : "\u200b", inline: true
                        }))
                }
                await interaction.reply({embeds: [...embeds]})
                break
            case "match":
                if (!queue[interaction.guildId]) {
                    queue[interaction.guildId] = []
                }
                joinedPlayers = queue[interaction.guildId].map((player) => player.name)
                let playerUser

                try {
                    playerUser = await bot.users.fetch(args[1].slice(2, -1))
                } catch {
                    playerUser = null
                }
                if (playerUser === interaction.author) {
                    await interaction.reply("You can't join yourself in matchmaking.")
                } else if (!joinedPlayers.includes(playerUser)) {
                    await interaction.reply("That player is not currently in the Matchmaking queue")
                } else {
                    let reply = await playerUser.send(interaction.author.displayName + " has sent you a match request. Do you want to accept?")
                    await reply.react("✅")
                    await reply.react("❌")
                    const filter = (reaction) => {
                        return reaction.emoji.name === "✅" || reaction.emoji.name === "❌"
                    }
                    const collector = reply.createReactionCollector({filter, max: 1});
                    collector.on('collect', r => {
                        if (r.emoji.name === "✅") {
                            interaction.author.send(`${playerUser.displayName} accepted your match request. Send them a DM to make the match happen.`)
                            queue[interaction.guildId] = queue[interaction.guildId].filter((queue) => queue !== playerUser)

                        } else {
                            interaction.author.send(`${playerUser.displayName} did not accept your match request.`)
                        }
                    })
                }
                break
            case "leave":
                if (!queue[interaction.guildId]) {
                    queue[interaction.guildId] = []
                }
                joinedPlayers = queue[interaction.guildId].map((player) => player.name)
                if (joinedPlayers.includes(interaction.author)) {
                    queue[interaction.guildId] = queue[interaction.guildId].filter((player) => player.name !== interaction.author)
                    await interaction.react("✅")
                } else {
                    await interaction.reply("You aren't in the queue")
                }
                break
            default:
                interaction.reply("Possible arguments: join, check, match, leave")
        }
    },
};