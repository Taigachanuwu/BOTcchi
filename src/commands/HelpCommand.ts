import {BaseCommand} from "./model/BaseCommand";
import {Client, EmbedBuilder, Message} from "discord.js";
import {commandHandler} from "../index";
import {buildHelpPage} from "./utility/helpers";

export class HelpCommand extends BaseCommand {
    constructor() {
        super(
            "help",
            "Sends the user a command list to use. \nUsage: !help { optional: 'general', 'ranked' }",
            ["user"],
            "general",
        )
    }

    async execute(interaction: Message, args: string[], bot: Client): Promise<void> {
        let embed: EmbedBuilder[] = []
        // Object.groupBy doesnt work
        const commands = commandHandler.getCommands().reduce((categories: Record<string, BaseCommand[]>, command: BaseCommand) => {
            if (!categories[command.category]) {
                categories[command.category] = [];
            }
            categories[command.category].push(command)
            return categories;
        }, {})
        for (const [key, value] of Object.entries(commands)) {
            if (!args[0] || args[0].toLowerCase() === "here" || key === args[0]) {
                embed.push(buildHelpPage(interaction, value, key))
            }
        }


        if (embed.length === 0) {
            await interaction.reply("Thats not a valid category")
            return
        }
        if (!args[0] || args[0].toLowerCase() !== "here") {
            await interaction.react("✅")
            await interaction.author.send({embeds: embed})
        } else if ("send" in interaction.channel) {
            await interaction.channel.send({embeds: embed})
        }
    }
}