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
        "player_name":      player["player_name"],
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

function simulateSeason(matchHistory) {
    let playerStats = {}
    for (let i = 0; i < matchHistory.length; i++) {
        let [firstPlayer, secondPlayer] = [matchHistory[i]["first_player"], matchHistory[i]["second_player"]]
        if(!(firstPlayer in playerStats)){
            playerStats[firstPlayer] = {player_name: firstPlayer, current_rating: 500, max_rating: 0, min_rating: 0, total_matches: 0, wins: 0, losses: 0, won_games: 0, lost_games: 0, current_streak: 0, best_streak: 0, server_id: matchHistory[i]["server_ID"]}
        }
        if(!(secondPlayer in playerStats)){
            playerStats[secondPlayer] = {player_name: secondPlayer, current_rating: 500, max_rating: 0, min_rating: 0, total_matches: 0, wins: 0, losses: 0, won_games: 0, lost_games: 0, current_streak: 0, best_streak: 0, server_id: matchHistory[i]["server_ID"]}
        }
        let newFirstPlayer = getNewStats(playerStats[firstPlayer], playerStats[secondPlayer], +matchHistory[i]["score_first_player"], +matchHistory[i]["score_second_player"]);
        let newSecondPlayer = getNewStats(playerStats[secondPlayer], playerStats[firstPlayer], +matchHistory[i]["score_second_player"], +matchHistory[i]["score_first_player"]);
        playerStats[firstPlayer] = newFirstPlayer
        playerStats[secondPlayer] = newSecondPlayer
    }
    return Object.values(playerStats).sort((a, b) => b.current_rating - a.current_rating)
}

module.exports = {getNewStats, simulateSeason}