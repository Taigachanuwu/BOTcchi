import {BaseCommand} from './model/BaseCommand';
import {Client, Message} from "discord.js";

export class AvatarCommand extends BaseCommand {
    constructor() {
        super(
            'avatar',
            'Gets the profile picture of a user. \nUsage: !avatar [Discord Tag]',
            ["user"],
            "general"
        )
    }

    async execute(interaction: Message, args: string[], bot: Client): Promise<void> {
        let userID = args.length !== 0 ? args[0].slice(2, -1) : null
        let user = userID !== null ? await bot.users.fetch(userID) : interaction.author
        await interaction.reply(user.displayAvatarURL({size: 4096}))
    }
}