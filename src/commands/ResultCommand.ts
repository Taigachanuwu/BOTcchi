import {BaseCommand} from "./model/BaseCommand";
import {Client, Message} from "discord.js";

import {getPlayerStats, addResultToDatabase} from "./utility/database";
import Discord from "discord.js";
import {isAdmin} from "./utility/helpers";

export class ResultCommand extends BaseCommand {
    constructor() {
        super(
            "result",
            "Adds a result between two players to the ranked database. \nUsage: !result [Discord Tag] [Discord Tag] [Score P1 - Score P2]",
            ["admin"],
            "ranked",
        )
    }

    async execute(interaction: Message, args: string[], bot: Client): Promise<void> {
        if (!isAdmin(interaction) || !interaction.guildId || !interaction.guild) return;
        if (args.length !== 3) {
            await interaction.reply("Seems like you didn't add enough parameters!")
            return
        }
        // TODO Change to check if user exists
        if (!args[0].startsWith("<@") || !args[1].startsWith("<@")) {
            await interaction.reply("You have to enter two discord accounts, you dummy!")
            return
        }
        if (args[0] === args[1]) {
            await interaction.reply("You have to enter two **different** discord accounts, silly. :3")
            return
        }
        if (!args[2].includes("-") && !args[2].includes(":")) {
            await interaction.reply("It seems like the result was not entered properly. Please try again")
            return
        }
        let [firstPlayer, firstStats] = [await bot.users.fetch(args[0].slice(2, -1)), getPlayerStats(interaction.guildId, args[0])]
        let [secondPlayer, secondStats] = [await bot.users.fetch(args[1].slice(2, -1)), getPlayerStats(interaction.guildId, args[1])]
        let isError = addResultToDatabase(args, interaction.guildId.toString())
        if (isError) {
            await interaction.reply("Oops, im sorry, something went wrong while trying to add the result to the database!")
            return
        }
        let firstStatsAfter = getPlayerStats(interaction.guildId, args[0])
        let secondStatsAfter = getPlayerStats(interaction.guildId, args[1])
        let firstPlayerDifference = Math.round(firstStatsAfter.current_rating) - Math.round(firstStats["current_rating"])
        let secondPlayerDifference = Math.round(secondStatsAfter.current_rating) - Math.round(secondStats["current_rating"])
        let result = args[2].split(/[-:]/)
        let embed = new Discord.EmbedBuilder()
            .setColor(0xE8A7A1)
            .setTitle('Match Result')
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .addFields({
                name: `${firstPlayer.username} ->  ${args[2]}  <- ${secondPlayer.username}`,
                value: '\u200b'
            })
        if (result[0] !== result[1]) {
            embed.addFields({
                name: `${result[0] < result[1] ? secondPlayer.username : firstPlayer.username} is on a ${firstStatsAfter.current_streak <= 0 ? secondStatsAfter.current_streak : firstStatsAfter.current_streak} game winning streak!`,
                value: '\u200b'
            })
        }
        embed.addFields({
            name: firstPlayer.username,
            value: Math.round(firstStats["current_rating"]) + (firstPlayerDifference > 0 ? " + " : " - ") + Math.abs(firstPlayerDifference) + " :arrow_right: " + Math.round(firstStatsAfter.current_rating),
            inline: true
        })
        embed.addFields({
            name: secondPlayer.username,
            value: Math.round(secondStats["current_rating"]) + (secondPlayerDifference > 0 ? " + " : " - ") + Math.abs(secondPlayerDifference) + " :arrow_right: " + Math.round(secondStatsAfter.current_rating),
            inline: true
        })

        await interaction.reply({embeds: [embed]})
    }
}