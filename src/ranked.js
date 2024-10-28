const database = require("better-sqlite3")('D:\\discord-bot\\src\\databanks\\test.db')

function createRankedTables(serverName){
    let tableName = "matches_" + serverName
    let sql = "CREATE TABLE IF NOT EXISTS " + tableName + "(id integer, first_player varchar, second_player varchar, score_first_player integer, score_second_player integer, winner varchar, date integer default current_timestamp)"
    database.exec(sql)
    tableName = "player_stats_" + serverName
    sql = "CREATE TABLE IF NOT EXISTS " + tableName + "(player_name varchar, current_rating integer, max_rating integer, min_rating integer, total_matches integer,wins integer, losses integer, won_games integer, lost_games integer, current_streak integer, best_streak integer)"
    database.exec(sql)
}