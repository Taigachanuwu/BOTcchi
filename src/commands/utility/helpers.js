const Discord = require("discord.js");

function isAdmin(msg) {
    try {
        return msg.member.permissionsIn(msg.channel).has(Discord.PermissionsBitField.Flags.Administrator)
    } catch {
        return false
    }
}

function buildHelpPage(message, value, key) {
    let page = new Discord.EmbedBuilder()
        .setTitle(`Commands: ${key}`)
        .setColor(0xE8A7A1)
        .setThumbnail(message.guild.iconURL())
        .setTimestamp()
    for (let i = 0; i < value.length; i++) {
        if (isAdmin(message) || value[i].permissions !== "admin") {
            page.addFields({
                name: value[i].name,
                value: value[i].description
            })
        }
    }
    return page
}

module.exports = {isAdmin, buildHelpPage}