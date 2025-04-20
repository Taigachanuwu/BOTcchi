import {BaseCommand} from "./model/BaseCommand";
import {Client, Message} from "discord.js";
import {Artifact} from "./model/genshinArtifactSimulator/Artifact";
import {getArtifactImage} from "./utility/artifacts";
import {getArtifact, pushArtifact, updateArtifact} from "./utility/database";

export class ArtifactCommand extends BaseCommand {
    constructor() {
        super(
            'artifact',
            'Functionality revolving Genshin Artifacts. \nUsage: !artifact {create, view, level}',
            ["user"],
            "general"
        )
    }

    async execute(interaction: Message, args: string[], bot: Client): Promise<void> {
        switch (args[0]) {
            case "view":
                await this.viewArtifact(interaction, args[1])
                break
            case "level":
                await this.levelArtifact(interaction, args[1], args[2] || '1')
                break
            case "create":
                await this.createArtifact(interaction)
                break
            case "_":
                break
        }
    }

    private async createArtifact(interaction: Message) {
        let artifact: Artifact = new Artifact("Marechaussee Hunter");
        await interaction.reply({files: [await getArtifactImage(artifact)]})
        pushArtifact(interaction, artifact)
    }

    private async viewArtifact(interaction: Message, id: string) {
        if(Number.isNaN(id)) {
            await interaction.reply("Please enter a valid id")
            return
        }
        let artifact: Artifact | null = getArtifact(+id)
        if (artifact == null) {
            await interaction.reply("There is no artifact with the id")
            return
        }
        await interaction.reply({files: [await getArtifactImage(artifact)]})
        return
    }

    private async levelArtifact(interaction: Message, id: string, level: string) {
        if(Number.isNaN(id)) {
            await interaction.reply("Please enter a valid id")
            return
        }
        if(Number.isNaN(level)) {
            await interaction.reply("Please enter a valid level")
            return
        }
        let artifact: Artifact | null = getArtifact(+id)
        if (artifact == null) {
            await interaction.reply("There is no artifact with the id")
            return
        }
        for (let i = 0; i < +level; i++) {
            artifact.levelArtifact()
        }
        await interaction.reply({files: [await getArtifactImage(artifact)]})
        updateArtifact(+id, artifact)
        return
    }
}