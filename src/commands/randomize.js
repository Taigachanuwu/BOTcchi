const Discord = require("discord.js");
module.exports = {
    name: "teams",
    description: "Creates two random teams out of the people currently in the voice chat. \nUsage: !teams { optional: [number of players] }",
    permissions: "user",
    category: "general",
    async execute(interaction, args) {
        const member = interaction.guild.members.cache.get(interaction.author.id)
        let players = member.voice.channel.members.map(player => player.displayName)
        const playerAmount = players.length // isNaN(+args[0]) ? players.length : +args[0]
        if(playerAmount < 2) {
            interaction.reply("There have to be at least 2 players to create random teams.")
            return
        }
        if (players.length < playerAmount) {
            interaction.reply("It seems like there are not enough people in the voice chat to create two teams. Please name the remaining players")
            // create event listener for next message of member
        } else if(players.length > playerAmount) {
            interaction.reply("It seems like there are too many people in the voice chat to create two teams. Please name the non-participating people")
            // create event listener for names in players array
        } else {
            let randomizedPlayers = players.sort(function() { return 0.5 - Math.random();})
            let firstTeam = randomizedPlayers.slice(0,Math.ceil(playerAmount/2))
            let secondTeam = randomizedPlayers.slice(Math.ceil(playerAmount/2),playerAmount)
            let embed = new Discord.EmbedBuilder()
                .setColor(0xE8A7A1)
                .setTitle('Teams')
                .setThumbnail(interaction.guild.iconURL())
                .setTimestamp()
                .addFields({
                    name: "Team 1:",
                    value: firstTeam.join("\n")
                })
                .addFields({
                    name: "Team 2:",
                    value: secondTeam.join("\n")
                })
            interaction.reply({embeds: [embed]})
        }
    },
};