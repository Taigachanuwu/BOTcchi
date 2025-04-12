import {BaseCommand} from "./model/BaseCommand";
import {Client, Message, MessageReaction, User} from "discord.js";

import Discord from "discord.js";
let queue: Record<string, Array<{name: User, message: string}>> = {}

export class QueueCommand extends BaseCommand {
    constructor() {
        super(
            "queue",
            "Matchmaking queue with the help of BOTcchi. \nUsage: !queue [ 'join { optional: join message }', 'match [Discord Tag]', 'leave', 'check' ]",
            ["user"],
            "ranked",
        )
    }

    async execute(interaction: Message, args: string[], bot: Client): Promise<void> {
        if (!interaction.guildId || !interaction.guild) {
            return
        }
        if (args.length === 0) {
            await interaction.reply("Possible arguments: join, check, match, leave")
            return
        }
        let joinedPlayers
        let guildId = interaction.guildId
        let serverIcon = interaction.guild.iconURL()
        switch (args[0].toLowerCase()) {
            case "join":
                if (!queue[guildId]) {
                    queue[guildId] = []
                }
                let playerJSON = {
                    name: interaction.author,
                    message: interaction.content.substring(12)
                }
                joinedPlayers = queue[guildId].map((player) => player.name)
                if (!joinedPlayers.includes(playerJSON.name)) {
                    queue[guildId].push(playerJSON)
                    await interaction.react("✅")
                } else {
                    await interaction.reply("You cant join the queue twice")
                }
                break
            case "check":
                if (!queue[guildId]) {
                    queue[guildId] = []
                }
                let embeds
                if (queue[guildId].length === 0) {
                    embeds = [
                        new Discord.EmbedBuilder()
                            .setColor(0xE8A7A1)
                            .setTitle('Matchmaking Queue')
                            .setThumbnail(serverIcon)
                            .setTimestamp()
                            .addFields({
                                name: "No one joined the queue",
                                value: "Join the queue by typing '!queue join'!"
                            })
                    ]
                } else {
                    embeds = queue[guildId].map((player) => new Discord.EmbedBuilder()
                        .setColor(0xE8A7A1)
                        .setTitle('Matchmaking Queue')
                        .setThumbnail(serverIcon)
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
                if (!queue[guildId]) {
                    queue[guildId] = []
                }
                joinedPlayers = queue[guildId].map((player) => player.name)
                let playerUser: User

                try {
                    playerUser = await bot.users.fetch(args[1].slice(2, -1))
                } catch {
                    break
                }
                if (playerUser === interaction.author) {
                    await interaction.reply("You can't join yourself in matchmaking.")
                } else if (!joinedPlayers.includes(playerUser)) {
                    await interaction.reply("That player is not currently in the Matchmaking queue")
                } else {
                    let reply = await playerUser.send(interaction.author.displayName + " has sent you a match request. Do you want to accept?")
                    await reply.react("✅")
                    await reply.react("❌")
                    const filter = (reaction: MessageReaction) => {
                        return reaction.emoji.name === "✅" || reaction.emoji.name === "❌"
                    }
                    const collector = reply.createReactionCollector({filter, max: 1});
                    collector.on('collect', r => {
                        if (r.emoji.name === "✅") {
                            interaction.author.send(`${playerUser.displayName} accepted your match request. Send them a DM to make the match happen.`)
                            queue[guildId] = queue[guildId].filter((queue) => queue.name !== playerUser)

                        } else {
                            interaction.author.send(`${playerUser.displayName} did not accept your match request.`)
                        }
                    })
                }
                break
            case "leave":
                if (!queue[guildId]) {
                    queue[guildId] = []
                }
                joinedPlayers = queue[guildId].map((player) => player.name)
                if (joinedPlayers.includes(interaction.author)) {
                    queue[guildId] = queue[guildId].filter((player) => player.name !== interaction.author)
                    await interaction.react("✅")
                } else {
                    await interaction.reply("You aren't in the queue")
                }
                break
            default:
                await interaction.reply("Possible arguments: join, check, match, leave")
        }
    }
}