const {
    Client,
    GatewayIntentBits,
    Partials,
    ChannelType
} = require("discord.js");

const askAI = require("./ai");


// ===============================
// GPTPrime Discord Client
// ===============================

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


// ===============================
// ENVIRONMENT CHECK
// ===============================

if (!process.env.DISCORD_TOKEN) {

    console.error(
        "❌ DISCORD_TOKEN bulunamadı!"
    );

    process.exit(1);

}

if (!process.env.OPENROUTER_API_KEY) {

    console.error(
        "❌ OPENROUTER_API_KEY bulunamadı!"
    );

    process.exit(1);

}


// ===============================
// BOT READY
// ===============================

client.once("ready", () => {

    console.log("");
    console.log("=================================");
    console.log("🤖 GPTPrime AKTİF!");
    console.log("=================================");
    console.log(`👤 Bot: ${client.user.tag}`);
    console.log(`🆔 ID: ${client.user.id}`);
    console.log("💬 DM sistemi hazır.");
    console.log("🧠 OpenRouter AI hazır.");
    console.log("🎮 Minecraft uzman sistemi hazır.");
    console.log("💻 Discord uzman sistemi hazır.");
    console.log("=================================");
    console.log("");

});


// ===============================
// DM MESSAGE SYSTEM
// ===============================

client.on("messageCreate", async (message) => {

    // Bot mesajlarını yok say
    if (message.author.bot) return;


    // Sadece DM
    if (
        message.channel.type !==
        ChannelType.DM
    ) {
        return;
    }


    const content =
        message.content?.trim();


    // Boş mesajları yok say
    if (!content) return;


    console.log(
        `📩 DM | ${message.author.tag}: ${content}`
    );


    try {

        // Yazıyor göstergesi
        await message.channel.sendTyping();


        // AI'ya gönder
        const response =
            await askAI(
                message.author.id,
                content
            );


        if (!response) {

            await message.reply(
                "🤖 Şu anda cevap oluşturamadım."
            );

            return;
        }


        // Discord maksimum mesaj uzunluğu
        const MAX_LENGTH = 1900;


        // Kısa cevap
        if (
            response.length <=
            MAX_LENGTH
        ) {

            await message.reply(
                response
            );

            return;
        }


        // Uzun cevapları böl
        for (
            let i = 0;
            i < response.length;
            i += MAX_LENGTH
        ) {

            const chunk =
                response.slice(
                    i,
                    i + MAX_LENGTH
                );


            await message.channel.send(
                chunk
            );

        }


    } catch (error) {

        console.error(
            "❌ GPTPrime hata:",
            error
        );


        let errorMessage =
            "❌ Şu anda bir hata oluştu. Biraz sonra tekrar dene.";


        if (
            error.message &&
            error.message.includes(
                "OPENROUTER_API_KEY"
            )
        ) {

            errorMessage =
                "❌ OpenRouter API anahtarı bulunamadı. Railway Variables kısmını kontrol et.";

        }


        if (
            error.status === 401
        ) {

            errorMessage =
                "❌ OpenRouter API anahtarı geçersiz.";

        }


        if (
            error.status === 429
        ) {

            errorMessage =
                "⏳ OpenRouter ücretsiz kullanım limitine ulaşıldı. Daha sonra tekrar deneyelim.";

        }


        if (
            error.status === 402
        ) {

            errorMessage =
                "💳 OpenRouter'da kullanılabilir kredi bulunmuyor.";

        }


        await message.reply(
            errorMessage
        );

    }

});


// ===============================
// DISCORD ERROR
// ===============================

client.on("error", (error) => {

    console.error(
        "❌ Discord Client Error:",
        error
    );

});


// ===============================
// PROCESS ERRORS
// ===============================

process.on(
    "unhandledRejection",
    (error) => {

        console.error(
            "❌ Unhandled Rejection:",
            error
        );

    }
);


process.on(
    "uncaughtException",
    (error) => {

        console.error(
            "❌ Uncaught Exception:",
            error
        );

    }
);


// ===============================
// LOGIN
// ===============================

console.log(
    "🔄 GPTPrime Discord'a bağlanıyor..."
);


client.login(
    process.env.DISCORD_TOKEN
);
