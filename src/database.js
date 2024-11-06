const ranked = require("./ranked");
const database = require("better-sqlite3")('D:\\discord-bot\\src\\databanks\\test.db')

function createRankedTables(serverName){
    let tableName = "matches_" + serverName
    let sql = "CREATE TABLE IF NOT EXISTS " + tableName + "(id integer, first_player varchar, second_player varchar, score_first_player integer, score_second_player integer, winner varchar, date integer default current_timestamp)"
    database.exec(sql)
    tableName = "player_stats_" + serverName
    sql = "CREATE TABLE IF NOT EXISTS " + tableName + "(player_name varchar, current_rating integer, max_rating integer, min_rating integer, total_matches integer,wins integer, losses integer, won_games integer, lost_games integer, current_streak integer, best_streak integer)"
    database.exec(sql)
}
function createPlayerEntry(player, serverID){
    let tableName = "player_stats_" + serverID
    let sql = "INSERT INTO " + tableName + " VALUES(?,?,?,?,?,?,?,?,?,?,?)"
    database.prepare(sql).run(player,500,500,500,0,0,0,0,0,0,0)
    sql = "SELECT * FROM " + tableName + " WHERE player_name = ?"
    return database.prepare(sql).get(player)
}
function getMatchHistory(serverID, entries) {
    let tableName = "matches_" + serverID
    let sql = "SELECT * FROM " + tableName + " ORDER BY id DESC"
    return database.prepare(sql).all().slice(0, entries)
}
function getPlayerStats(serverID, playerID) {
    let tableName = "player_stats_" + serverID
    let sql = "SELECT * FROM " + tableName + " WHERE player_name = ?"
    return database.prepare(sql).get(playerID)
}
function getTableCount(tableName) {
    let sql = "SELECT * FROM " + tableName
    return database.prepare(sql).all().length
}
function updateStatsDatabase(firstPlayer, secondPlayer, firstPlayerScore, secondPlayerScore, serverID) {
    let tableName = "player_stats_" + serverID
    let sql = "SELECT * FROM " + tableName + " WHERE player_name = ?"
    let firstPlayerStats = database.prepare(sql).get(firstPlayer) ?? createPlayerEntry(firstPlayer, serverID)
    let secondPlayerStats = database.prepare(sql).get(secondPlayer) ?? createPlayerEntry(secondPlayer, serverID)
    let newFirstStat = ranked.getNewStats(firstPlayerStats, secondPlayerStats, firstPlayerScore, secondPlayerScore)
    let newSecondStat = ranked.getNewStats(secondPlayerStats, firstPlayerStats, secondPlayerScore, firstPlayerScore)
    sql = "UPDATE " + tableName + " SET current_rating = ?, max_rating = ?, min_rating = ?, total_matches = ?, wins = ?, losses = ?, won_games = ?, lost_games = ?, current_streak = ?, best_streak = ? WHERE player_name = ?"
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
        firstPlayer
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
        secondPlayer
    )
}
function addResultToDatabase(matchResult, serverID) {
    let firstPlayer = matchResult[1]
    let secondPlayer = matchResult[2]
    let [scoreFirstPlayer, scoreSecondPlayer] =
        matchResult[3].includes("-") ? matchResult[3].split("-")
            : matchResult[3].includes("-") ? matchResult[3].split(":")
                : ["wrong", "wrong"]
    let winner = +scoreFirstPlayer < +scoreSecondPlayer ? secondPlayer : +scoreFirstPlayer > +scoreSecondPlayer ? firstPlayer : "Tie"
    let tableName = "matches_" + serverID
    let sql = "INSERT INTO " + tableName + "(id,first_player,second_player,score_first_player,score_second_player,winner) VALUES (?,?,?,?,?,?)"
    database.prepare(sql).run(getTableCount(tableName) + 1, matchResult[1], matchResult[2], scoreFirstPlayer, scoreSecondPlayer, winner)
    db.updateStatsDatabase(firstPlayer, secondPlayer, scoreFirstPlayer, scoreSecondPlayer, serverID)
}

function doesDatabaseExist(tableName) {
    let sql = "SELECT count(*) FROM sqlite_master WHERE type='table' AND name=" + "'matches_" + tableName + "'"
    return database.exec(sql) !== 0
}

module.exports = {createRankedTables, getMatchHistory, getPlayerStats, updateStatsDatabase, addResultToDatabase, doesDatabaseExist}