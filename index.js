require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    Partials
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

client.once("clientReady", () => {
    console.log(`🤖 GPTPrime aktif: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {

    try {

        if (message.author.bot) return;

        // Sadece DM
        if (message.guild) return;

        const userId = message.author.id;

        let text = message.content?.trim() || "";

        let imageUrl = null;

        // Ekleri kontrol et
        if (message.attachments.size > 0) {

            const image = message.attachments.find(
                attachment =>
                    attachment.contentType &&
                    attachment.contentType.startsWith("image/")
            );

            if (image) {
                imageUrl = image.url;
            }
        }

        // Hiçbir şey gönderilmediyse cevap verme
        if (!text && !imageUrl) return;

        await message.channel.sendTyping();

        console.log(
            `📩 DM | ${message.author.tag} | ${imageUrl ? "Görsel + mesaj" : "Mesaj"}`
        );

        const answer = await askAI(
            userId,
            text,
            imageUrl
        );

        if (!answer) return;

        // Discord mesaj limitini aşarsa böl
        const chunks = [];

        for (let i = 0; i < answer.length; i += 1900) {
            chunks.push(
                answer.slice(i, i + 1900)
            );
        }

        for (const chunk of chunks) {
            await message.channel.send(chunk);
        }

    } catch (error) {

        console.error(
            "❌ GPTPrime DM Hatası:",
            error
        );

        let errorMessage =
            "Şu anda bir hata oluştu knk 😕";

        if (error.message) {

            if (
                error.message.includes(
                    "OpenRouter API anahtarı"
                )
            ) {
                errorMessage =
                    "OpenRouter API anahtarıyla ilgili bir sorun var knk. 🔑";
            }

            else if (
                error.message.includes(
                    "kullanılabilir kredi"
                )
            ) {
                errorMessage =
                    "OpenRouter'da kullanılabilir kredi yok knk. 💳";
            }

            else if (
                error.message.includes(
                    "kullanım limitine"
                )
            ) {
                errorMessage =
                    "OpenRouter kullanım limitine ulaşıldı knk. ⏳";
            }

            else if (
                error.message.includes(
                    "boş cevap"
                )
            ) {
                errorMessage =
                    "AI bu sefer boş cevap döndürdü knk, tekrar dener misin? 🤖";
            }
        }

        await message.channel.send(
            errorMessage
        );
    }
});

client.login(
    process.env.DISCORD_TOKEN
);
