export function getNewStats(player: PlayerStats, opponent: PlayerStats, playerScore: number, opponentScore: number): PlayerStats {
    let expectationValuePlayer = 10 ** (player.current_rating / 400) / (10 ** (player.current_rating / 400) + 10 ** (opponent.current_rating / 400))
    let resultPlayer = (playerScore > opponentScore ? 1 : playerScore < opponentScore ? 0 : 0.5)
    let newRating = player.current_rating + 50 * (resultPlayer - expectationValuePlayer)
    let newStreak = (currentStreak: number, isWin: number) => {
        if (isWin < 0) {
            return Math.min(currentStreak - 1, -1)
        } else if (isWin > 0) {
            return Math.max(currentStreak + 1, 1)
        } else {
            return currentStreak
        }
    }
    let newishStreak = newStreak(player.current_streak, playerScore - opponentScore)
    return new PlayerStats(
        player.player_name,
        newRating,
        Math.max(player.max_rating, newRating),
        Math.min(player.min_rating, newRating),
        player.total_matches + 1,
        player.wins + (playerScore > opponentScore ? 1 : 0),
        player.losses + (playerScore < opponentScore ? 1 : 0),
        +player.won_games + +playerScore,
        +player.lost_games + +opponentScore,
        newishStreak,
        Math.max(newishStreak, player.best_streak),
        player.server_id
    )
}

export function simulateSeason(matchHistory: string | any[]) {
    let playerStatsList: Record<string, PlayerStats> = {}
    for (let i = 0; i < matchHistory.length; i++) {
        let [firstPlayer, secondPlayer] = [matchHistory[i]["first_player"], matchHistory[i]["second_player"]]
        if (!(firstPlayer in playerStatsList)) {
            playerStatsList[firstPlayer] = new PlayerStats(
                firstPlayer,
                500,
                500,
                500,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                matchHistory[i]["server_ID"]
            )
        }
        if (!(secondPlayer in playerStatsList)) {
            playerStatsList[secondPlayer] = new PlayerStats(
                secondPlayer,
                500,
                500,
                500,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                matchHistory[i]["server_ID"]
            )
        }
        let newFirstPlayer = getNewStats(playerStatsList[firstPlayer], playerStatsList[secondPlayer], +matchHistory[i]["score_first_player"], +matchHistory[i]["score_second_player"]);
        let newSecondPlayer = getNewStats(playerStatsList[secondPlayer], playerStatsList[firstPlayer], +matchHistory[i]["score_second_player"], +matchHistory[i]["score_first_player"]);
        playerStatsList[firstPlayer] = newFirstPlayer
        playerStatsList[secondPlayer] = newSecondPlayer
    }
    return Object.values(playerStatsList).sort((a, b) => b.current_rating - a.current_rating)
}

export class PlayerStats {
    player_name: string
    current_rating: number
    max_rating: number
    min_rating: number
    total_matches: number
    wins: number
    losses: number
    won_games: number
    lost_games: number
    current_streak: number
    best_streak: number
    server_id: string

    constructor(
        player_name: string,
        current_rating: number,
        max_rating: number,
        min_rating: number,
        total_matches: number,
        wins: number,
        losses: number,
        won_games: number,
        lost_games: number,
        current_streak: number,
        best_streak: number,
        server_id: string
    ) {
        this.player_name = player_name
        this.current_rating = current_rating
        this.max_rating = max_rating
        this.min_rating = min_rating
        this.total_matches = total_matches
        this.wins = wins
        this.losses = losses
        this.won_games = won_games
        this.lost_games = lost_games
        this.current_streak = current_streak
        this.best_streak = best_streak
        this.server_id = server_id
    }
}