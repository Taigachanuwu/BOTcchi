import {BaseCommand} from "./model/BaseCommand";
import {Client, Message} from "discord.js";
import {updateReactionActivation, isReactionActivated, updateServerReactionActivation} from "./utility/database";
import {isAdmin} from "./utility/helpers";

export class ReactionsCommand extends BaseCommand {
    constructor() {
        super(
            "reactions",
            "Toggles BOTcchis reaction memes to keywords. \nUsage: !reactions { optional: 'server' }",
            ["admin"],
            "general",
        )
    }

    async execute(interaction: Message, args: string[], bot: Client): Promise<void> {
        if (!isAdmin(interaction)) {
            return
        }
        let reaction = !isReactionActivated(interaction.channelId)
        if (args.length === 0) {
            updateReactionActivation(interaction.channelId, reaction)
            await interaction.reply("T-The reactions are turned to " + reaction.toString() + "!")
        } else if (args[0] === "server") {
            updateServerReactionActivation(interaction.guildId, reaction)
            await interaction.reply("T-The reactions for the whole server are turned to " + reaction.toString() + "!")
        }
    }
}