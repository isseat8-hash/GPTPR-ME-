require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Partials,
    ChannelType
} = require("discord.js");

const askAI = require("./ai");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel
    ]
});

client.once("ready", () => {
    console.log("=================================");
    console.log("🤖 GPTPrime aktif!");
    console.log(`👤 Bot: ${client.user.tag}`);
    console.log("💬 DM sistemi hazır.");
    console.log("=================================");
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // Sadece DM
    if (message.channel.type !== ChannelType.DM) return;

    const content = message.content?.trim();

    if (!content) return;

    try {
        await message.channel.sendTyping();

        const response = await askAI(
            message.author.id,
            content
        );

        if (!response) {
            await message.reply(
                "Bir cevap oluşturamadım. 😕"
            );
            return;
        }

        // Discord mesaj limiti
        if (response.length <= 2000) {
            await message.reply(response);
            return;
        }

        // Uzun cevapları parçalara böl
        for (let i = 0; i < response.length; i += 1900) {
            await message.channel.send(
                response.slice(i, i + 1900)
            );
        }

    } catch (error) {
        console.error("GPTPrime hata:", error);

        await message.reply(
            "Şu anda bir hata oluştu. Biraz sonra tekrar dene. 🤖"
        );
    }
});

client.on("error", (error) => {
    console.error("Discord Client Error:", error);
});

process.on("unhandledRejection", (error) => {
    console.error("Unhandled Rejection:", error);
});

if (!process.env.DISCORD_TOKEN) {
    console.error("❌ DISCORD_TOKEN bulunamadı!");
    process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY bulunamadı!");
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
