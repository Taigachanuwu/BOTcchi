const db = require("./utility/database");
const Discord = require("discord.js");
const {isAdmin} = require("./utility/helpers")

module.exports = {
    name: "result",
    description: "Adds a result between two players to the ranked database. \nUsage: !result [Discord Tag] [Discord Tag] [Score P1 - Score P2]",
    permissions: "admin",
    category: "ranked",
    async execute(interaction, args, bot) {
        if (!isAdmin(interaction)) return;
        let matchResult = interaction.content.split(" ")
        if (matchResult.length !== 4) {
            await interaction.reply("Seems like you didn't add enough parameters!")
            return
        }
        // TODO Change to check if user exists
        if (!matchResult[1].startsWith("<@") || !matchResult[2].startsWith("<@")) {
            await interaction.reply("You have to enter two discord accounts, you dummy!")
            return
        }
        if (matchResult[1] === matchResult[2]) {
            await interaction.reply("You have to enter two **different** discord accounts, silly. :3")
            return
        }
        if (!matchResult[3].includes("-") && !matchResult[3].includes(":")) {
            await interaction.reply("It seems like the result was not entered properly. Please try again")
            return
        }
        let [firstPlayer, firstStats] = [await bot.users.fetch(matchResult[1].slice(2, -1)), db.getPlayerStats(interaction.guildId, matchResult[1])]
        let [secondPlayer, secondStats] = [await bot.users.fetch(matchResult[2].slice(2, -1)), db.getPlayerStats(interaction.guildId, matchResult[2])]
        let isError = db.addResultToDatabase(matchResult, interaction.guildId.toString())
        if (isError) {
            await interaction.reply("Oops, im sorry, something went wrong while trying to add the result to the database!")
            return
        }
        let firstStatsAfter = db.getPlayerStats(interaction.guildId, matchResult[1])
        let secondStatsAfter = db.getPlayerStats(interaction.guildId, matchResult[2])
        let firstPlayerDifference = Math.round(firstStatsAfter.current_rating) - Math.round(firstStats["current_rating"])
        let secondPlayerDifference = Math.round(secondStatsAfter.current_rating) - Math.round(secondStats["current_rating"])
        let result = matchResult[3].split(/[-:]/)
        let embed = new Discord.EmbedBuilder()
            .setColor(0xE8A7A1)
            .setTitle('Match Result')
            .setThumbnail(interaction.guild.iconURL())
            .setTimestamp()
            .addFields({
                name: `${firstPlayer.username} ->  ${matchResult[3]}  <- ${secondPlayer.username}`,
                value: '\u200b'
            })
        if (result[0] !== result[1]) {
            embed.addFields({
                name: `${result[0] < result[1] ? secondPlayer.username : firstPlayer.username} is on a ${firstStatsAfter.current_streak <= 0 ? secondStatsAfter.current_streak : firstStatsAfter.current_streak} game winning streak!`,
                value: '\u200b'
            })
        }
        embed.addFields({
            name: firstPlayer.globalName,
            value: Math.round(firstStats["current_rating"]) + (firstPlayerDifference > 0 ? " + " : " - ") + Math.abs(firstPlayerDifference) + " :arrow_right: " + Math.round(firstStatsAfter.current_rating),
            inline: true
        })
        embed.addFields({
            name: secondPlayer.username,
            value: Math.round(secondStats["current_rating"]) + (secondPlayerDifference > 0 ? " + " : " - ") + Math.abs(secondPlayerDifference) + " :arrow_right: " + Math.round(secondStatsAfter.current_rating),
            inline: true
        })

        await interaction.reply({embeds: [embed]})
    },
};