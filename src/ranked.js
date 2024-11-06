function getNewStats(player, opponent, playerScore, opponentScore){
    let expectationValuePlayer = 10 ** (player["current_rating"]/400) / (10 ** (player["current_rating"]/400) + 10 ** (opponent["current_rating"]/400))

    let resultPlayer = (playerScore > opponentScore ? 1 : playerScore < opponentScore ? 0 : 0.5)

    let newRating = player["current_rating"] + 50 * (resultPlayer - expectationValuePlayer)

    let newStreak = (currentStreak, isWin) => {
        if (isWin < 0) {
            return Math.min(currentStreak - 1, -1)
        } else if (isWin > 0) {
            return Math.max(currentStreak + 1, 1)
        } else {
            return currentStreak
        }
    }

    let newishStreak = newStreak(player["current_streak"], playerScore - opponentScore)

    return {
        "current_rating":   newRating,
        "max_rating":       Math.max(player["max_rating"], newRating),
        "min_rating":       Math.min(player["min_rating"], newRating),
        "total_matches":    player["total_matches"] + 1,
        "wins":             player["wins"] + (playerScore > opponentScore ? 1 : 0),
        "losses":           player["losses"] + (playerScore < opponentScore ? 1 : 0),
        "won_games":        +player["won_games"] + +playerScore,
        "lost_games":       +player["lost_games"] + +opponentScore,
        "current_streak":   newishStreak,
        "best_streak":      Math.max(newishStreak, player["best_streak"])
    }
}

module.exports = {getNewStats}