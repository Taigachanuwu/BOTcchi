const {buildHelpPage} = require("./utility/helpers")

module.exports = {
    name: "help",
    description: "Sends the user a command list to use. \nUsage: !help { optional: 'general', 'ranked' }",
    permissions: "user",
    category: "general",
    async execute(interaction, args, bot) {
        let embed = []

        // Object.groupBy doesnt work
        const commands = bot.commands.reduce((x, y) => {

            (x[y.category] = (x[y.category] || [])).push(y);

            return x;

        }, {})
        console.log(commands)
        for(const [key, value] of Object.entries(commands)) {
            if ( !args[0] || args[0].toLowerCase() === "here" || key === args[0] ) {
                embed.push(buildHelpPage(interaction, value, key))
            }
        }

        if (embed.length !== 0 && (!args[0] || args[0].toLowerCase() !== "here")) {
            await interaction.react("✅")
            await interaction.author.send({embeds: embed})
        } else if (embed.length !== 0) {
            await interaction.channel.send({embeds: embed})
        } else {
            await interaction.reply("Thats not a valid category")
        }
    },
};