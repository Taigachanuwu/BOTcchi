import {Client, Collection, Message} from 'discord.js';
import {BaseCommand} from './BaseCommand';
import fs = require("fs");
import path = require('path');

export class CommandHandler {
    private commands = new Collection<string, BaseCommand>();

    constructor(private bot: Client, private prefix: string) {}

    public getCommands(): Collection<string, BaseCommand> {
        return this.commands
    }

    public async loadCommands(commandsPath: string) {
        const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

        for (const file of files) {
            const filePath = path.resolve(commandsPath, file);
            const { [path.parse(file).name]: CommandClass } = await import(filePath);

            if (typeof CommandClass === 'function') {
                const commandInstance = new CommandClass() as BaseCommand;
                this.commands.set(commandInstance.name, commandInstance);
            }
        }
    }

    public async handleMessage(message: Message) {
        if (message.author.bot || !message.content.startsWith(this.prefix)) return;

        const args = message.content.slice(this.prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        const command = this.commands.get(commandName);
        if (command) {
            try {
                await command.execute(message, args, this.bot);
            } catch (error) {
                console.error(error);
                await message.reply("There was an error trying to execute that command!");
            }
        }
    }
}