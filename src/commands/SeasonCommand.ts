import {BaseCommand} from "./model/BaseCommand";
import {Client, Message, User} from "discord.js";
import {getRankedLeaderboardSeason} from "./utility/database";
import {PlayerStats} from "./utility/ranked";
import {isUserInServer} from "./utility/helpers";

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
        let argument = !!args[0] ? parseFloat(args[0]) : null
        let leaderboard
        if (argument === null) {
            leaderboard = getRankedLeaderboardSeason(interaction.guildId)
        } else {
            leaderboard = getRankedLeaderboardSeason(interaction.guildId, argument)
        }
        let messageReply = `${interaction.guild.name}:\n\nRank      Name                   Win Loss Draw\n`
        let placement: number = 0
        for (let i = 0; i < leaderboard.length; i++) {
            let stats = leaderboard[i]
            let user: User = await bot.users.fetch(stats["player_name"].slice(2, -1))
            try {
                user = await bot.users.fetch(stats["player_name"].slice(2, -1))
                if (interaction.guild && await isUserInServer(interaction.guild, user)) {
                    messageReply += this.buildTable(stats, user, placement)
                    placement++
                }
            } catch {

            }
        }
        interaction.channel.send("```" + (leaderboard.length !== 0 ? messageReply : "There are no records for this season") + "```")
    }
    private buildTable(stats: PlayerStats, user: User, i: number) :string {
        let messageReply = ""
        let secondLine = "Games Played: ".padStart(24, " ") + stats["total_matches"].toString().padEnd(4, " ") + "--->" + stats["wins"].toString().padStart(3," ") + stats["losses"].toString().padStart(5," ") + (+stats["total_matches"] - +stats["wins"] - +stats["losses"]).toString().padStart(5," ") + "\n"
        let thirdLine = "Highest / Lowest: --->".padStart(32, " ") + ` ${Math.round(+stats["max_rating"])} MMR / ${Math.round(+stats["min_rating"])} MMR\n`
        messageReply += `${("<" + (i + 1) + ">:").padEnd(7, " ")}-> ${user.globalName ? user.globalName : user.username} - ${Math.round(+stats["current_rating"])} MMR\n`
        messageReply += secondLine
        messageReply += thirdLine
        return messageReply
    }
}