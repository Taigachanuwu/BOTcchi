module.exports = {
    name: "role",
    description: "Creates a user role with an editable color. \nUsage: !role { create, change [color code] }",
    permissions: "user",
    category: "general",
    async execute(interaction, args) {
        let role
        switch (args[0]) {
            case "create":
                role = interaction.guild.roles.cache.find(role => role.name === interaction.author.username) || null
                if (!role) {
                    await interaction.guild.roles.create({
                        name: interaction.author.username,
                    })
                    role = interaction.guild.roles.cache.find(role => role.name === interaction.author.username)
                }
                interaction.guild.members.cache.get(interaction.author.id).roles.add(role);
                break;
            case "change":
                role = interaction.guild.roles.cache.find(role => role.name === interaction.author.username)
                try {
                    role.edit({color: args[1]})
                    console.log("hi")
                } catch {
                    interaction.reply("This isn't a valid color code.")
                }
                break;
            default:
                interaction.reply("Thats not a valid argument.")
        }
    },
};