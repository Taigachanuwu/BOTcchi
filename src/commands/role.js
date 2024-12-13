module.exports = {
    name: "role",
    description: "Creates a user role with an editable color. \nUsage: !role { create, change [color code] }",
    permissions: "user",
    category: "general",
    async execute(interaction, args) {
        let role
        switch (args[0]) {
            case "create":
                let existedAlready = true
                role = interaction.guild.roles.cache.find(role => role.name === interaction.author.username) || null
                if (!role) {
                    existedAlready = false
                    await interaction.guild.roles.create({
                        name: interaction.author.username,
                    })
                    role = interaction.guild.roles.cache.find(role => role.name === interaction.author.username)
                }
                interaction.guild.members.cache.get(interaction.author.id).roles.add(role);
                if (existedAlready) {
                    interaction.reply("Your personal role exists already.")
                } else {
                    interaction.reply("Your personal role was successfully set up!")
                }
                break;
            case "change":
                role = interaction.guild.roles.cache.find(role => role.name === interaction.author.username)
                try {
                    await role.edit({color: args[1]})
                } catch {
                    interaction.reply("This isn't a valid color code.")
                }
                break;
            default:
                interaction.reply("Thats not a valid argument.")
        }
    },
};