import {BaseCommand} from "./model/BaseCommand";
import {Client, Message} from "discord.js";


import {getPlayerStats} from "./utility/database";
import Discord from "discord.js";

// TO DO: person specific query
export class StatsCommand extends BaseCommand {
    constructor() {
        super(
            "stats",
            "Returns the stats of the user or the tagged person. \nUsage: !stats { optional: Discord Tag }",
            ["user"],
            "ranked",
        )
    }

    async execute(interaction: Message, args: string[], bot: Client): Promise<void> {
        // need to check if message argument is a discord user or not
        if (!interaction.guildId) return
        let playerID = args.length === 0 ? "<@" + interaction.author.id + ">" : args[0]
        let player = await bot.users.fetch(playerID.slice(2, -1)).then(player => player.avatarURL())
        let playerStats = getPlayerStats(interaction.guildId.toString(), playerID)
        let embed = new Discord.EmbedBuilder()
            .setColor(0xE8A7A1)
            .setTitle('Player Stats')
            .setDescription(`User: ${interaction.author.username}`)
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

        await interaction.reply({embeds: [embed]})
    }
}