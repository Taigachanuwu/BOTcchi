import {BaseCommand} from "./model/BaseCommand";
import {Client, Message} from "discord.js";
import {getRankedLeaderboardSeason} from "./utility/database";
import {buildTable, getCurrentRankedSeason} from "./utility/helpers";

export class SeasonCommand extends BaseCommand {
    constructor() {
        super(
            "season",
            "Gets a ranked leaderboard. Usage: !season { optional: number }",
            ["user"],
            "ranked",
        )
    }

    async execute(interaction: Message, args: string[], bot: Client): Promise<void> {
        if (!interaction.guild || !("send" in interaction.channel)) {
            return
        }
        let argument = !!args[0] ? parseFloat(args[0]) : getCurrentRankedSeason(new Date())
        let leaderboard = getRankedLeaderboardSeason(interaction.guildId, argument)
        let messageReply = `${interaction.guild.name} Season ${argument}:\n\nRank      Name                   Win Loss Draw\n`
        messageReply = await buildTable(leaderboard, interaction, messageReply)
        interaction.channel.send("```" + (leaderboard.length !== 0 ? messageReply : "There are no records for this season") + "```")
    }
}