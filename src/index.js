require("dotenv").config()
const Discord = require("discord.js")
const { createReactionsEntry, isReactionActivated } = require("./database");
const bot = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMembers,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.MessageContent,
        Discord.IntentsBitField.Flags.GuildMessageReactions,
        Discord.IntentsBitField.Flags.DirectMessageReactions
    ],
})
const fs = require("fs");
const commandFiles = fs.readdirSync("src/commands").filter(file => file.endsWith(".js"));

bot.commands = new Discord.Collection();

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

// create prefix database for changeability
let prefix = "!"
let queue = {}
let statuses = [
    "The One Piece is real!",
    "Nah, I'd win",
    "Stand proud. You're strong.",
    "So its the same type of stand as Star Platinum",
    "Ah yes, the random bullshit go technique I didn't use since the Heian Era",
    "Ah yes, the anti-social technique I haven't used since yesterday",
    "did i piss myself or is that just the drip.",
    "I smoke real Amrani rapscallion ghost nuggets, y'all can't fuck with me. ~Dracula",
    "They must have amnesia. They forgot I'm him.",
    "I hope them aliens are real so I have more to fuck",
    "Hey you want something random? Try to guess what happens I dare you https://youtube.com/shorts/SzHx-d7N0Bg?si=D8Js8Z5_XI2YeKWl",
    "Yes, I am!",
    "Pizza Mozza- rella!",
    "OK Masta let's kill da ho! BEEEEEEEETCH!",
    "Never give up on gambling 🔥🔥🔥",
    "99% of people quit gambling right before the jackpot!",
    "You know what, all of you better duck. Because I'm about to turn left and I don't wanna smack you with my dick.",
    "What I understand is I am going to pound you so hard the boys' mother is going to be jealous.",
    "Huh, this is a new feeling. Pride in someone else. Unfortunately, its overshadowed by all this unyielding rage!",
    "Skibidi Toilet",
    "Why do I always have to drink water only to piss it out again? This place is a prison.",
    "Nuke the french (sorry Auro)",
    "Heavens door, remove his ability to cum!",
    "Check out my perfect form. It's perfect!",
    "A beverage of sorts?"
]

async function getChannelIds() {
    const discordServers = bot.guilds.cache;
    let channels = discordServers.map(discordServer => discordServer.channels.cache)
    channels = channels.map(guild => guild.map(channel => [channel.id, channel.guildId])).flat()
    return channels
}

bot.on("ready", (c) => {
    console.log(c.user.tag.split("#")[0] + " is ready uwu")
    getChannelIds().then(channels => channels.forEach(channel => createReactionsEntry(channel[0], channel[1])))
    setInterval(() => {
        let randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        bot.user.setActivity({
            name: randomStatus,
            type: Discord.ActivityType.Custom
        });
    }, 5 * 60 * 1000);
})

bot.on("guildCreate", (c) => {
    console.log("Joined " + c.name)
    getChannelIds().then(channels => channels.forEach(channel => createReactionsEntry(channel[0], channel[1])))
})

bot.on("channelCreate", (c) => {
    console.log("New channel was created: " + c.guild.name, c.name)
    createReactionsEntry(c.id, c.guildId)
})

bot.on("messageCreate", async (message) => {
    try {
        if (message.author.bot) return;
        let response = isReactionActivated(message.channelId)
        if (response) {
            if (message.content.includes("Bingo")) {
                await message.reply({files: [{attachment: "assets/gojo-bingo.gif", name: "getBingoed.gif"}]})
            }
            if (message.content.includes("cock")) {
                await message.reply({files: [{attachment: "assets/cockbending.png", name: "cockbending.jpg"}]})
            }
            if (message.content.includes("prince of all saiyans")) {
                await message.reply({files: [{attachment: "assets/princeofallsaiyans.mp4", name: "video.mp4"}]})
            }
            if (message.content.toLowerCase().includes("awesome fucking tien edit")) {
                await message.reply({files: [{attachment: "assets/coolTienEdit.mp4", name: "video.mp4"}]})
            }
            if (message.content.includes("goku")) {
                let image = [
                    "assets/gokucircles/7fe.jpg",
                    "assets/gokucircles/9c9.jpg",
                    "assets/gokucircles/img.png",
                    "assets/gokucircles/img_1.png",
                    "assets/gokucircles/niko-from-dragon-ball-z-v0-vemp5dgmo73e1.webp",
                ]
                await message.reply({
                    files: [{
                        attachment: image[Math.floor(Math.random() * image.length)],
                        name: "image.png"
                    }]
                })
            }
            if (message.content.includes("the drink")) {
                let clip = [
                    "assets/thedrink/the_cup.mov",
                    "assets/thedrink/they_call_him_the_what.mov",
                    "assets/thedrink/u_think.mov",
                    "assets/thedrink/the_cup.mov",
                ]
                await message.reply({
                    files: [{
                        attachment: clip[Math.floor(Math.random() * clip.length)],
                        name: "video.mp4"
                    }]
                })
            }
        }
        if (!message.content.startsWith(prefix)) return;
        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = bot.commands.get(commandName);
        if (!command) return;
        try {
            await command.execute(message, args, bot);
        } catch (error) {
            console.error(error);
            await message.reply("There was an error trying to execute that command!");
        }
    } catch (e) {
        console.log(e)
        await message.reply("Oops, seems like I caught an error.")
    }
})
bot.login(process.env.DISCORD_BOT_KEY)