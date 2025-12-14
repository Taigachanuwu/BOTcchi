import {BaseCommand} from "./model/BaseCommand";
import {Client, Message} from "discord.js";
import {getRankedLeaderboard} from "./utility/database";
import {buildTable} from "./utility/helpers";
import {PlayerStats} from "./utility/ranked";

const orderKeys = [
    "current_rating",
    "max_rating",
    "min_rating",
    "total_matches",
    "wins",
    "losses",
    "won_games",
    "lost_games",
    "current_streak",
    "best_streak",
]

export class RankingCommand extends BaseCommand {
    constructor() {
        super(
            'ranking',
            'Gets a ranked leaderboard.',
            ["user"],
            "ranked"
        )
    }

    async execute(interaction: Message, args: string[], bot: Client): Promise<void> {
        if (!interaction.guild || !("send" in interaction.channel)) {
            return
        }
        let argument = !!args[0] ? args[0] : null
        let leaderboard: PlayerStats[]
        if (argument === null || !orderKeys.includes(argument)) {
            leaderboard = getRankedLeaderboard(interaction.guildId)
        } else {
            leaderboard = getRankedLeaderboard(interaction.guildId, argument)
        }
        let messageReply: string = `${interaction.guild ? interaction.guild.name : ""}:\n\nRank      Name                   Win Loss Draw\n`
        messageReply = await buildTable(leaderboard, interaction, messageReply)
        interaction.channel.send("```" + messageReply + "```")
    }

}