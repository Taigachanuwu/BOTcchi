const db = require("../database");
const {isAdmin} = require("./utility/helpers");

module.exports = {
    name: "createrankedtable",
    description: "Creates the prerequisite ranked tables for your server. \nUsage: !createRankedTable",
    permissions: "admin",
    category: "ranked",
    async execute(interaction) {
        if (!isAdmin(interaction)) {
            return
        }
        if (!db.doesDatabaseExist(interaction.guildId)) {
            db.createRankedTables(interaction.guildId)
            await interaction.reply("The ranked database has been set up!")
        } else {
            await interaction.reply("The ranked database is already set up.")
        }
    },
};