const {updateReactionActivation, isReactionActivated, updateServerReactionActivation} = require("./utility/database");
const {isAdmin} = require("./utility/helpers")

module.exports = {
    name: "reactions",
    description: "Toggles BOTcchis reaction memes to keywords. \nUsage: !reactions { optional: 'server' }",
    permissions: "admin",
    category: "general",
    async execute(interaction, args) {
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
    },
};