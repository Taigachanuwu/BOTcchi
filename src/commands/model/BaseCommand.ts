import {Client, Message} from 'discord.js';

export abstract class BaseCommand {
    name: string
    description: string
    permissions: string[]
    category: string

    protected constructor(name: string, description: string, permissions: string[], category: string) {
        this.name = name
        this.description = description
        this.permissions = permissions
        this.category = category
    }

    abstract execute(
        interaction: Message,
        args: string[],
        bot: Client,

    ): Promise<void>
}