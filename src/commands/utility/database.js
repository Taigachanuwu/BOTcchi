require("dotenv").config()
const ranked = require("./ranked");
const database = require("better-sqlite3")(process.env.FILE_PATH)

function createPlayerEntry(player, serverID){
    let sql = "INSERT INTO player_stats VALUES(?,?,?,?,?,?,?,?,?,?,?,?)"
    database.prepare(sql).run(player,500,500,500,0,0,0,0,0,0,0, serverID)
    sql = "SELECT * FROM player_stats WHERE player_name = ? AND server_ID = ?"
    return database.prepare(sql).get(player, serverID)
}
function createReactionsEntry(channelID, serverID) {
    let statement = "SELECT * FROM reactions WHERE channel_id = ?"
    if (!database.prepare(statement).get(channelID)) {
        let sql = "INSERT INTO reactions VALUES(?,?,false)"
        database.prepare(sql).run(channelID,serverID)
    }
}
function getMatchHistory(serverID, entries) {
    let sql = `SELECT * FROM matches WHERE server_id = ? ORDER BY id DESC`
    return database.prepare(sql).all(serverID).slice(0, entries)
}
function getPlayerStats(serverID, playerID) {
    let sql = "SELECT * FROM player_stats WHERE player_name = ? AND server_id = ?"
    return database.prepare(sql).get(playerID, serverID) ?? createPlayerEntry(playerID, serverID)
}
function getTableCount(tableName) {
    let sql = `SELECT * FROM ${tableName}`
    return database.prepare(sql).all().length
}
function getRankedLeaderboard(serverID, orderKey = "current_rating") {
    let sql = `SELECT * FROM player_stats WHERE server_id = ? ORDER BY ? DESC`
    return database.prepare(sql).all(serverID, orderKey)
}
function updateStatsDatabase(firstPlayer, secondPlayer, firstPlayerScore, secondPlayerScore, serverID) {
    let sql = "SELECT * FROM player_stats WHERE player_name = ? AND server_id = ?"
    let firstPlayerStats = database.prepare(sql).get(firstPlayer, serverID)
    let secondPlayerStats = database.prepare(sql).get(secondPlayer, serverID)
    let newFirstStat = ranked.getNewStats(firstPlayerStats, secondPlayerStats, firstPlayerScore, secondPlayerScore)
    let newSecondStat = ranked.getNewStats(secondPlayerStats, firstPlayerStats, secondPlayerScore, firstPlayerScore)
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
function updateReactionActivation(channelID, reactions) {
    let sql = "UPDATE reactions SET activated = ? WHERE channel_id = ?"
    database.prepare(sql).run(reactions ? 1 : 0, channelID)
}

function updateServerReactionActivation(serverID, reactions) {
    let sql = "UPDATE reactions SET activated = ? WHERE server_id = ?"
    database.prepare(sql).run(reactions ? 1 : 0, serverID)
}

function addResultToDatabase(matchResult, serverID) {
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

function isReactionActivated(channelID) {
    let sql = "SELECT activated FROM reactions WHERE channel_id = ?"
    return database.prepare(sql).get(channelID)["activated"]
}

module.exports = {createReactionsEntry, getMatchHistory, getPlayerStats, getRankedLeaderboard, updateReactionActivation, updateServerReactionActivation, addResultToDatabase, isReactionActivated}