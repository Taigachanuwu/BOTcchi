import {Client, Message} from 'discord.js';

export abstract class BaseCommand {
    name: string
    description: string
    permissions: string[]
    category: string
    alternativeNames: string[]

    protected constructor(name: string, description: string, permissions: string[], category: string, alternativeNames: string[] = []) {
        this.name = name
        this.description = description
        this.permissions = permissions
        this.category = category
        this.alternativeNames = alternativeNames
    }

    abstract execute(
        interaction: Message,
        args: string[],
        bot: Client,

    ): Promise<void>
}