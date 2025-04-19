import {BaseCommand} from "./model/BaseCommand";
import {Client, Message} from "discord.js";
import {Artifact} from "./model/genshinArtifactSimulator/Artifact";
import {getArtifactImage} from "./utility/artifacts";
import {pushArtifact} from "./utility/database";

export class ArtifactCommand extends BaseCommand {
    constructor() {
        super(
            'artifact',
            'Functionality revolving Genshin Artifacts. \nUsage: !artifact {create}',
            ["user"],
            "general"
        )
    }

    async execute(interaction: Message, args: string[], bot: Client): Promise<void> {
        switch (args[0]) {
            case "create":
                await this.createArtifact(interaction);
                break;
            case "_":
                break;
        }
    }

    private async createArtifact(interaction: Message) {
        let artifact: Artifact = new Artifact("Marechaussee Hunter");
        await interaction.reply({files: [await getArtifactImage(artifact)]})
        pushArtifact(interaction, artifact)
    }
}