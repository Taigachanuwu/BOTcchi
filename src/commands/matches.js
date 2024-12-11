const db = require("../database");
const Discord = require("discord.js");

module.exports = {
    name: "matches",
    description: "Returns the last matches played on this server. \nUsage: !matches { optional: number, default: 5 }",
    permissions: "user",
    category: "ranked",
    async execute(interaction, args) {
        let entries = args.length === 0 ? 5 : args[0]
        console.log(entries)
        const matchHistory = db.getMatchHistory(interaction.guildId.toString(), entries)
        let embed = []
        for (let i = 0; i < matchHistory.length; i++) {
            let page = Math.floor(i / 25)
            if (i % 25 === 0) {
                embed[page] = new Discord.EmbedBuilder()
                    .setColor(0xE8A7A1)
                    .setTitle('Match History')
                    .setDescription(`Last ${matchHistory.length} matches`)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp()
            }
            let entry = matchHistory[i]
            embed[page].addFields({
                name:  `Match ${entry["id"]}`,
                value: `${entry["first_player"]} ${entry["score_first_player"]} - ${entry["score_second_player"]} ${entry["second_player"]}`
            })
        }
        await interaction.reply({embeds: [...embed]})
    },
};