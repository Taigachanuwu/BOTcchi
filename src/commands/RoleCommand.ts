import {BaseCommand} from "./model/BaseCommand";
import {Client, Message} from "discord.js";

export class RoleCommand extends BaseCommand {
    constructor() {
        super(
            "role",
            "Creates a user role with an editable color. \nUsage: !role { create, change [color code] }",
            ["user"],
            "general",
        )
    }

    async execute(interaction: Message, args: string[], bot: Client): Promise<void> {
        if(!interaction.guild || !interaction.member || !bot.user) {
            return
        }
        let role
        let botUser = bot.user
        switch (args[0]) {
            case "create":
                let existedAlready = true
                role = interaction.guild.roles.cache.find(role => role.name === interaction.author.username) || null
                if (!role) {
                    existedAlready = false
                    let botRole = interaction.guild.roles.cache.find(role => role.name === botUser.username)
                    if (!botRole) {
                        await interaction.reply("It seems like there is an issue with the creation of the role\nMaybe check if the bot has a role!")
                        return
                    }
                    await interaction.guild.roles.create({
                        name: interaction.author.username,
                        position: botRole.position
                    })
                    role = interaction.guild.roles.cache.find(role => role.name === interaction.author.username)
                }
                if(role) {
                    await interaction.member.roles.add(role);
                }
                if (existedAlready) {
                    await interaction.reply("Your personal role exists already.")
                } else {
                    await interaction.reply("Your personal role was successfully set up!")
                }
                break;
            case "change":
                role = interaction.guild.roles.cache.find(role => role.name === interaction.author.username)
                if(!role) {
                    await interaction.reply("You have to create your role first!")
                    return
                }
                try {
                    // @ts-ignore because args is string[] and a string cant be typed into ColorResolvable apparently
                    await role.edit({color: args[1]})
                } catch {
                    await interaction.reply("This isn't a valid color code.")
                }
                break;
            default:
                await interaction.reply("That's not a valid argument.")
        }
    }
}