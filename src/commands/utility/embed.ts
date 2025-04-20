import {EmbedBuilder, Message, MessageReaction, PermissionsBitField, User} from "discord.js";

export async function buildEmbedPages(message: Message, pageArray: EmbedBuilder[]) {
    function removeReaction(removeEmoji: string) {
        if(message.guild !== undefined && message.guild !== null) {
            msg.reactions.cache.find(r => r.emoji.name === removeEmoji)?.users.remove(message.author.id)
        }
    }

    let page = 0;
    let msg: Message
    if('send' in message.channel) {
        msg = await message.channel.send({embeds: [pageArray[page]]})
    } else {return}
    const reactions = {"⬅️": "backPage", "➡️": "frontPage", "🗑️": "deleteEmbed"}
    Object.keys(reactions).forEach(reaction => {
        msg.react(reaction)
    })

    const backwardsFilter = (reaction: MessageReaction, user: User) => reaction.emoji.name === '⬅️' && user.id === message.author.id
    const forwardsFilter = (reaction: MessageReaction, user: User) => reaction.emoji.name === '➡️' && user.id === message.author.id
    const deleteEmbedFilter = (reaction: MessageReaction, user: User) => reaction.emoji.name === '🗑️' && user.id === message.author.id

    const backwards = msg.createReactionCollector({filter: backwardsFilter, time: 60000, dispose: true})
    const forwards = msg.createReactionCollector({filter: forwardsFilter, time: 60000, dispose: true})
    const deleteEmbed = msg.createReactionCollector({filter: deleteEmbedFilter, time: 60000})

    function filterReaction(filterOption: string) {
        backwards.on(filterOption, async() => {
            page === 0 ? page = pageArray.length : page--;
            await msg.edit({embeds: [pageArray[page]]});
            removeReaction('⬅️');
        })
        forwards.on(filterOption, async() => {
            page == pageArray.length - 1 ? page = 0 : page++;
            await msg.edit({embeds: [pageArray[page]]});
            removeReaction('➡️');
        })
    }
    if(message.channel.type.toString() !== 'dm') {
        filterReaction('collect');
    }
    deleteEmbed.on('collect', async() => {
        if(message.channel.type.toString() !== 'dm')
            if(message.guild?.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels)) await message.delete();
        await msg.delete();
    })
}
