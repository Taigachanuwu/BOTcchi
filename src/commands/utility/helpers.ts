import {Message} from "discord.js";
import {BaseCommand} from "../model/BaseCommand";

import Discord from "discord.js";
export function isAdmin(msg: Message) :boolean {
    if (!msg.member) {
        return false
    }
    return msg.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)
}

export function buildHelpPage(message: Message, value: BaseCommand[], key: string) {
    let page = new Discord.EmbedBuilder()
    if (!message.guild) {
        return page
    }
    page.setTitle(`Commands: ${key}`)
        .setColor(0xE8A7A1)
        .setTimestamp()
        .setThumbnail(message.guild.iconURL())

    for (let i = 0; i < value.length; i++) {
        if (isAdmin(message) || !value[i].permissions.includes("admin")) {
            page.addFields({
                name: value[i].name,
                value: value[i].description
            })
        }
    }
    return page
}

module.exports = {isAdmin, buildHelpPage}