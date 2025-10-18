import {Guild, Message, User} from "discord.js";
import {BaseCommand} from "../model/BaseCommand";

import Discord from "discord.js";
export function isAdmin(msg: Message) :boolean {
    if (!msg.member) {
        return false
    }
    return msg.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator) || msg.author.id === "469447356195143680"
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

export async function isUserInServer(server: Guild, user: User): Promise<boolean> {
    let members = await server.members.fetch()
    members = members.filter(m => m.user.id === user.id)

    return members.size === 1
}

module.exports = {isAdmin, buildHelpPage, isUserInServer}