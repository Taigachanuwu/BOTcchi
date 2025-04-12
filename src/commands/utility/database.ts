require("dotenv").config()
import {getNewStats, simulateSeason, PlayerStats} from "./ranked";
const database = require("better-sqlite3")(process.env.FILE_PATH)

export function createPlayerEntry(player: any, serverID: any){
    let sql = "INSERT INTO player_stats VALUES(?,?,?,?,?,?,?,?,?,?,?,?)"
    database.prepare(sql).run(player,500,500,500,0,0,0,0,0,0,0, serverID)
    sql = "SELECT * FROM player_stats WHERE player_name = ? AND server_ID = ?"
    return database.prepare(sql).get(player, serverID)
}
export function createReactionsEntry(channelID: any, serverID: any) {
    let statement = "SELECT * FROM reactions WHERE channel_id = ?"
    if (!database.prepare(statement).get(channelID)) {
        let sql = "INSERT INTO reactions VALUES(?,?,false)"
        database.prepare(sql).run(channelID,serverID)
    }
}
export function getMatchHistory(serverID: any, entries: number|null = null) {
    let sql = `SELECT * FROM matches WHERE server_id = ? ORDER BY id DESC`
    return database.prepare(sql).all(serverID).slice(0, entries)
}
export function getPlayerStats(serverID: any, playerID: any) {
    let sql = "SELECT * FROM player_stats WHERE player_name = ? AND server_id = ?"
    return database.prepare(sql).get(playerID, serverID) ?? createPlayerEntry(playerID, serverID)
}
export function getTableCount(tableName: string) {
    let sql = `SELECT * FROM ${tableName}`
    return database.prepare(sql).all().length
}
export function getRankedLeaderboard(serverID: any, orderKey = "current_rating") {
    let sql = `SELECT * FROM player_stats WHERE server_id = ? ORDER BY ? DESC`
    return database.prepare(sql).all(serverID, orderKey)
}
export function getRankedLeaderboardSeason(serverID: any, season: number|null = null) {
    let timestamp = new Date()
    let currentSeason = season ?? 2 * (timestamp.getFullYear() - 2025) + (timestamp.getMonth() < 6 ? 1 : 2)
    let startDate = new Date(2025 + Math.floor(currentSeason/2), currentSeason % 2 === 0 ? 6 : 0, 1, 0, 0, 0)
    let endDate = new Date(startDate)
    endDate = new Date(endDate.setMonth(endDate.getMonth() + 6))
    let seasonHistory = getMatchHistory(serverID).filter((entry: { [x: string]: string | number | Date; }) => new Date(entry["date"]).getTime() >= startDate.getTime() && new Date(entry["date"]).getTime() < endDate.getTime())
    return simulateSeason(seasonHistory)
}
export function updateStatsDatabase(firstPlayer: any, secondPlayer: any, firstPlayerScore: any, secondPlayerScore: any, serverID: any) {
    let sql = "SELECT * FROM player_stats WHERE player_name = ? AND server_id = ?"
    let databaseExcerpt = database.prepare(sql).get(firstPlayer, serverID)
    let firstPlayerStats = new PlayerStats(
        databaseExcerpt["player_name"],
        databaseExcerpt["current_rating"],
        databaseExcerpt["max_rating"],
        databaseExcerpt["min_rating"],
        databaseExcerpt["total_matches"],
        databaseExcerpt["wins"],
        databaseExcerpt["losses"],
        databaseExcerpt["won_games"],
        databaseExcerpt["lost_games"],
        databaseExcerpt["current_streak"],
        databaseExcerpt["best_streak"],
        databaseExcerpt["server_id"]
    )
    databaseExcerpt = database.prepare(sql).get(secondPlayer, serverID)
    let secondPlayerStats = new PlayerStats(
        databaseExcerpt["player_name"],
        databaseExcerpt["current_rating"],
        databaseExcerpt["max_rating"],
        databaseExcerpt["min_rating"],
        databaseExcerpt["total_matches"],
        databaseExcerpt["wins"],
        databaseExcerpt["losses"],
        databaseExcerpt["won_games"],
        databaseExcerpt["lost_games"],
        databaseExcerpt["current_streak"],
        databaseExcerpt["best_streak"],
        databaseExcerpt["server_id"]
    )
    let newFirstStat: PlayerStats = getNewStats(firstPlayerStats, secondPlayerStats, firstPlayerScore, secondPlayerScore)
    let newSecondStat: PlayerStats = getNewStats(secondPlayerStats, firstPlayerStats, secondPlayerScore, firstPlayerScore)
    sql = "UPDATE player_stats SET current_rating = ?, max_rating = ?, min_rating = ?, total_matches = ?, wins = ?, losses = ?, won_games = ?, lost_games = ?, current_streak = ?, best_streak = ? WHERE player_name = ? AND server_id = ?"
    database.prepare(sql).run(
        newFirstStat["current_rating"],
        newFirstStat["max_rating"],
        newFirstStat["min_rating"],
        newFirstStat["total_matches"],
        newFirstStat["wins"],
        newFirstStat["losses"],
        newFirstStat["won_games"],
        newFirstStat["lost_games"],
        newFirstStat["current_streak"],
        newFirstStat["best_streak"],
        firstPlayer,
        serverID
    )
    database.prepare(sql).run(
        newSecondStat["current_rating"],
        newSecondStat["max_rating"],
        newSecondStat["min_rating"],
        newSecondStat["total_matches"],
        newSecondStat["wins"],
        newSecondStat["losses"],
        newSecondStat["won_games"],
        newSecondStat["lost_games"],
        newSecondStat["current_streak"],
        newSecondStat["best_streak"],
        secondPlayer,
        serverID
    )
}
export function updateReactionActivation(channelID: any, reactions: any) {
    let sql = "UPDATE reactions SET activated = ? WHERE channel_id = ?"
    database.prepare(sql).run(reactions ? 1 : 0, channelID)
}

export function updateServerReactionActivation(serverID: any, reactions: any) {
    let sql = "UPDATE reactions SET activated = ? WHERE server_id = ?"
    database.prepare(sql).run(reactions ? 1 : 0, serverID)
}

export function addResultToDatabase(matchResult: any[], serverID: any) {
    let firstPlayer = matchResult[1]
    let secondPlayer = matchResult[2]
    let [scoreFirstPlayer, scoreSecondPlayer] = matchResult[3].split(/[-:]/)
    if(isNaN(scoreFirstPlayer) || isNaN(scoreSecondPlayer)) {
        return true // it's wild that I made it return a boolean
    }
    let winner = +scoreFirstPlayer < +scoreSecondPlayer ? secondPlayer : +scoreFirstPlayer > +scoreSecondPlayer ? firstPlayer : "Tie"

    let sql = "INSERT INTO matches (id, first_player, second_player, score_first_player, score_second_player, winner, server_id) VALUES (?,?,?,?,?,?,?)"
    database.prepare(sql).run(getTableCount("matches") + 1, matchResult[1], matchResult[2], scoreFirstPlayer, scoreSecondPlayer, winner, serverID)
    updateStatsDatabase(firstPlayer, secondPlayer, scoreFirstPlayer, scoreSecondPlayer, serverID)
    return false
}

export function isReactionActivated(channelID: any) {
    let sql = "SELECT activated FROM reactions WHERE channel_id = ?"
    return database.prepare(sql).get(channelID)["activated"]
}