import Discord, {GuildMember, Message} from "discord.js";
import {BaseCommand} from "../model/BaseCommand";
import {PlayerStats} from "./ranked";

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

export function getCurrentRankedSeason(currentDate: Date) {
    return 2 * (currentDate.getFullYear() - 2025) + (currentDate.getMonth() < 6 ? 1 : 2)
}

export async function buildTable(leaderboard: PlayerStats[], interaction: Message, messageReply: string): Promise<string> {
    if (!interaction.guild || !("send" in interaction.channel)) {
        return ""
    }
    let placement: number = 0
    for (let i = 0; i < leaderboard.length; i++) {
        let stats = leaderboard[i]
        try {
            let user = interaction.guild.members.cache.get(stats["player_name"].slice(2, -1))
                ?? await interaction.guild.members.fetch(stats["player_name"].slice(2, -1)).catch(console.error)
            if (!user) {
                continue
            }
            messageReply += buildTableEntry(stats, user, placement)
            placement++
        } catch (e) {
            console.log(e)
        }
    }
    return messageReply
}

function buildTableEntry(stats: PlayerStats, member: GuildMember, i: number) :string {
    let messageReply = ""
    let secondLine =
        "Games Played: ".padStart(24, " ")
        + stats["total_matches"].toString().padEnd(4, " ")
        + "--->"
        + stats["wins"].toString().padStart(3," ")
        + stats["losses"].toString().padStart(5," ")
        + (+stats["total_matches"] - +stats["wins"] - +stats["losses"]).toString().padStart(5," ")
        + "\n"
    let thirdLine =
        "Highest / Lowest: --->".padStart(32, " ")
        + ` ${Math.round(+stats["max_rating"])} MMR / ${Math.round(+stats["min_rating"])} MMR\n`
    messageReply += `${("<" + (i + 1) + ">:").padEnd(7, " ")}-> ${member.nickname ?? member.user.username} - ${Math.round(+stats["current_rating"])} MMR\n`
    messageReply += secondLine
    messageReply += thirdLine
    return messageReply
}

module.exports = {isAdmin, buildHelpPage, buildTable, getCurrentRankedSeason}