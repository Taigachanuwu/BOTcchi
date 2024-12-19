require("dotenv").config()
const cron = require("cron");
const Discord = require("discord.js")
const {createReactionsEntry, isReactionActivated} = require("./commands/utility/database");
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
// https://discord.com/channels/1317023174361354282/1317023175300743231
const job = cron.CronJob.from({
    cronTime: '0 0 7 * * *',
    onTick: function () {
        let daysTillDandadan = (new Date(2025, 6, 1, 20).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        bot.channels.cache.get('1317023175300743231').send(`Es sind noch ${Math.round(daysTillDandadan)} Tage bis zur 2. Season von Dandadan!`)
    },
    start: true,
    timeZone: 'Europe/Berlin'
});

// create prefix database for changeability
let prefix = "_"
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
    "A beverage of sorts?",
    "If someone with one arm speaks sign language, is that a speech impediment or an accent?"
]

bot.commands = new Discord.Collection();
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

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
            if (message.content.toLowerCase().includes("okarun")) {
                let image = [
                    "assets/okarunGifs/dandadan-okarun.gif",
                    "assets/okarunGifs/okarun-dandadan.gif",
                ]
                await message.reply({
                    files: [{
                        attachment: image[Math.floor(Math.random() * image.length)],
                        name: "okarun.gif"
                    }]
                })
            }
            if (message.content.toLowerCase().includes("yoshikage")) {
                await message.reply("My name is Yoshikage Kira. I'm 33 years old. My house is in the northeast section of Morioh, where all the villas are, and I am not married. I work as an employee for the Kame Yu department stores, and I get home every day by 8 PM at the latest. I don't smoke, but I occasionally drink. I'm in bed by 11 PM, and make sure I get eight hours of sleep, no matter what. After having a glass of warm milk and doing about twenty minutes of stretches before going to bed, I usually have no problems sleeping until morning. Just like a baby, I wake up without any fatigue or stress in the morning. I was told there were no issues at my last check-up. I'm trying to explain that I'm a person who wishes to live a very quiet life. I take care not to trouble myself with any enemies, like winning and losing, that would cause me to lose sleep at night. That is how I deal with society, and I know that is what brings me happiness. Although, if I were to fight I wouldn't lose to anyone. ")
            }
            if (message.content.toLowerCase().includes("die türken machen das unmögliche immer möglich")) {
                await message.reply({files: [{attachment: "assets/turkiye.mov", name: "türkiye.mp4"}]})
            }
            if (message.content.toLowerCase().includes("bingo")) {
                await message.reply({files: [{attachment: "assets/gojo-bingo.gif", name: "getBingoed.gif"}]})
            }
            if (message.content.toLowerCase().includes("cock")) {
                await message.reply({files: [{attachment: "assets/cockbending.png", name: "cockbending.jpg"}]})
            }
            if (message.content.toLowerCase().includes("vegeta")) {
                await message.reply({files: [{attachment: "assets/princeofallsaiyans.mp4", name: "video.mp4"}]})
            }
            if (message.content.toLowerCase().includes("tien edit")) {
                await message.reply({files: [{attachment: "assets/coolTienEdit.mp4", name: "video.mp4"}]})
            }
            if (message.content.toLowerCase().includes("goku")) {
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
            if (message.content.toLowerCase().includes("the drink")) {
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