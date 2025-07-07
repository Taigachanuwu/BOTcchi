import {BaseCommand} from "./model/BaseCommand";
import {Client, Message} from "discord.js";

import {getMatchHistory, getMatchUpHistory, getPlayerHistory} from "./utility/database";
const Discord = require("discord.js");

export class MatchesCommand extends BaseCommand {
    constructor() {
        super(
            "matches",
            "Returns the last matches played on this server. \nUsage: !matches { optional: number, default: 5 }",
            ["user"],
            "ranked",
        )
    }

    async execute(interaction: Message, args: string[], bot: Client): Promise<void> {
        if(!interaction.guild || !interaction.guildId){
            return
        }

        let isUser: boolean = false
        let isOpponentUser: boolean = false
        let entriesIndex: number = 0

        // There's probably a more elegant way to solve this, but it should do the job
        if (args.length >= 1) {
            isUser = this.isUserID(args[0])
            if (isUser) {
                entriesIndex++
            }
        }
        if (args.length >= 2) {
            isOpponentUser = this.isUserID(args[1])
            if (isOpponentUser) {
                entriesIndex++
            }
        }

        let entries = args.length !== (entriesIndex + 1) ? 5 : +args[entriesIndex]

        let matchHistory: Record<string, string>[] = []
        if (entriesIndex == 0) {
            matchHistory = getMatchHistory(interaction.guildId.toString(), entries)
        } else if (entriesIndex == 1 && isUser) {
            matchHistory = getPlayerHistory(interaction.guildId.toString(), args[0], entries)
        } else if (entriesIndex == 2 && isOpponentUser) {
            matchHistory = getMatchUpHistory(interaction.guildId.toString(), args[0], args[1], entries)
        }

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
                name: `Match ${entry["id"]}`,
                value: `${entry["first_player"]} ${entry["score_first_player"]} - ${entry["score_second_player"]} ${entry["second_player"]}`
            })
        }
        if (embed.length > 0) {
            await interaction.reply({embeds: [...embed]})
        } else {
            await interaction.reply("There are no results for this query.")
        }
    }

    private isUserID(userID: string): boolean {
        if (!(userID.startsWith("<@") && userID.endsWith(">"))) {
            return false
        }
        let userIDNumber = userID.slice(2, -1)
        return !Number.isNaN(userIDNumber)
    }
}