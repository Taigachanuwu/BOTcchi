const {getRankedLeaderboard} = require("./utility/database")

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

module.exports = {
    name: "ranking",
    description: "Gets a ranked leaderboard.",
    permissions: "user",
    category: "ranked",
    async execute(interaction, args, bot) {
        let argument = !!args[0] ? args[0] : null
        let leaderboard
        if (argument === null || !orderKeys.includes(argument)) {
            leaderboard = getRankedLeaderboard(interaction.guildId)
        } else {
            leaderboard = getRankedLeaderboard(interaction.guildId, argument)
        }
        let messageReply = `${interaction.guild.name}:\n\nRank      Name                   Win Loss Draw\n`
        for (let i = 0; i < leaderboard.length; i++) {
            let stats = leaderboard[i]
            let user = await bot.users.fetch(stats["player_name"].slice(2, -1))
            let secondLine = "Games Played: ".padStart(24, " ") + stats["total_matches"].toString().padEnd(4, " ") + "--->" + stats["wins"].toString().padStart(3," ") + stats["losses"].toString().padStart(5," ") + (stats["total_matches"] - stats["wins"] - stats["losses"]).toString().padStart(5," ") + "\n"
            let thirdLine = "Highest / Lowest: --->".padStart(32, " ") + ` ${Math.round(stats["max_rating"])} MMR / ${Math.round(stats["min_rating"])} MMR\n`
            messageReply += `${("<" + (i + 1) + ">:").padEnd(7, " ")}-> ${user.globalName ? user.globalName : user.username} - ${Math.round(stats["current_rating"])} MMR\n`
            messageReply += secondLine
            messageReply += thirdLine
        }
        interaction.channel.send("```" + messageReply + "```")
    }
}