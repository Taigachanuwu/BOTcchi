import {Artifact} from "../model/genshinArtifactSimulator/Artifact";
import Canvas, {Image} from '@napi-rs/canvas';
import {AttachmentBuilder} from "discord.js";

export async function getArtifactImage(artifact: Artifact): Promise<AttachmentBuilder> {
    let canvas = Canvas.createCanvas(1080, 1858)
    let context = canvas.getContext("2d")
    let background: Image = await Canvas.loadImage(`assets/genshinArtifacts/${artifact.set.replace(" ", "")}${artifact.type.toString()}.png`)
    let stat: string
    context.drawImage(background, 0, 0, canvas.width, canvas.height)
    context.font = 'bold 60px Merriweather Sans';
    context.fillStyle = '#BFAFAA';
    stat = artifact.mainstat.toString()
    stat = stat.substring(stat.length - 1) === "%" ? stat.substring(0, stat.length - 1) : stat
    context.fillText(stat, 64, 380);
    context.fillStyle = '#FFFFFF'
    context.font = '110px Merriweather Sans'
    context.fillText(artifact.mainstat.getMainstatValue(), 64, 485)
    context.fillStyle = '#FFFFFF'
    context.font = '60px Merriweather Sans'
    context.fillText("+" + String(artifact.mainstat.getLevel()), 73, 736)
    for (let i = 0; i < artifact.substats.length; i++) {
        context.fillStyle = '#485265'
        context.font = 'bold 55px Merriweather Sans'
        stat = artifact.substats[i].toString()
        stat = stat.substring(stat.length - 1) === "%" ? stat.substring(0, stat.length - 1) : stat
        context.fillText("• " + stat + "+" + artifact.substats[i].getRollsFormatted(), 81, 846 + i * 84)
    }
    return new AttachmentBuilder(await canvas.encode('png'), {name: `${artifact.set.replace(" ", "")}${artifact.type.toString()}Lvl${artifact.mainstat.getLevel()}.png`})
}
