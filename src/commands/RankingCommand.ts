import {BaseCommand} from "./model/BaseCommand";
import {Client, Message, User} from "discord.js";
import {getRankedLeaderboard} from "./utility/database";

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
        let argument = !!args[0] ? args[0] : null
        let leaderboard: string | any[]
        if (argument === null || !orderKeys.includes(argument)) {
            leaderboard = getRankedLeaderboard(interaction.guildId)
        } else {
            leaderboard = getRankedLeaderboard(interaction.guildId, argument)
        }
        let messageReply = `${interaction.guild ? interaction.guild.name : ""}:\n\nRank      Name                   Win Loss Draw\n`
        for (let i = 0; i < leaderboard.length; i++) {
            let stats = leaderboard[i]
            let user = await bot.users.fetch(stats["player_name"].slice(2, -1))
            messageReply = this.buildTable(stats, user, messageReply, i)
        }
        if('send' in interaction.channel) {
            interaction.channel.send("```" + messageReply + "```")
        }
    }
    private buildTable(stats: Record<string, string>, user: User, messageReply: string, i: number) :string {
        let secondLine = "Games Played: ".padStart(24, " ") + stats["total_matches"].toString().padEnd(4, " ") + "--->" + stats["wins"].toString().padStart(3," ") + stats["losses"].toString().padStart(5," ") + (+stats["total_matches"] - +stats["wins"] - +stats["losses"]).toString().padStart(5," ") + "\n"
        let thirdLine = "Highest / Lowest: --->".padStart(32, " ") + ` ${Math.round(+stats["max_rating"])} MMR / ${Math.round(+stats["min_rating"])} MMR\n`
        messageReply += `${("<" + (i + 1) + ">:").padEnd(7, " ")}-> ${user.globalName ? user.globalName : user.username} - ${Math.round(+stats["current_rating"])} MMR\n`
        messageReply += secondLine
        messageReply += thirdLine
        return messageReply
    }
}