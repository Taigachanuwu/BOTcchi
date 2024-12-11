module.exports = {
    name: "avatar",
    description: "Gets the profile picture of a user. \nUsage: !avatar [Discord Tag]",
    permissions: "user",
    category: "general",
    async execute(interaction, args, bot) {
        let userID = args.length !== 0 ? args[0].slice(2, -1) : null
        let user = userID !== null ? await bot.users.fetch(userID) : interaction.author
        await interaction.reply(user.displayAvatarURL({size: 4096}))
    },
};
