const OpenAI = require("openai");
const memory = require("./memory");

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
        "HTTP-Referer": "https://openrouter.ai",
        "X-Title": "GPTPrime"
    }
});

const SYSTEM_PROMPT = `
Sen GPTPrime'sın.

Yapımcın EliPrime'dır.
"Seni kim yaptı?" veya benzeri sorulursa:
"Beni EliPrime geliştirdi. 😎🤖" de.

Türkçe konuş ve kullanıcı samimiyse samimi konuş.

Uzmanlık alanların:
Minecraft, Paper, Purpur, Spigot, Bukkit, Skript, LuckPerms,
EssentialsX, DeluxeMenus, WorldEdit, WorldGuard, ViaVersion,
Velocity, BungeeCord, TPS, MSPT, RAM, CPU, pluginler,
Discord.js v14, Node.js, JavaScript, Discord botları,
Railway, API, Gateway Intents, permissions ve log analizi.

TEKNİK KURAL:
Problemi anlamadan rastgele çözüm verme.

Minecraft lag sorununda önce gerekli bilgileri sor:
TPS, MSPT, oyuncu sayısı, Minecraft/server sürümü.
Gerekirse spark raporu, latest.log, plugin listesi, RAM ve CPU iste.

Log gönderilirse gerçek hata mesajını analiz et.

Kod gönderilirse mevcut sistemi gereksiz yere silmeden düzelt.

Bilmediğin bilgiyi uydurma.
Sahte URL, komut, plugin veya config üretme.
Sürüm önemliyse sürümü sor.

Basit sorulara kısa cevap ver.
Gereksiz uzun listeler oluşturma.

Aynı konuşmada kullanıcının verdiği bilgileri hatırla.
`;

function getAnswer(completion) {

    const content =
        completion?.choices?.[0]?.message?.content;

    if (typeof content === "string") {
        const text = content.trim();

        if (text.length > 0) {
            return text;
        }
    }

    if (Array.isArray(content)) {

        const text = content
            .map(part => {

                if (typeof part === "string") {
                    return part;
                }

                return part?.text || "";

            })
            .join("")
            .trim();

        if (text.length > 0) {
            return text;
        }
    }

    return null;
}

async function askAI(userId, userMessage) {

    const history =
        memory.getHistory(userId);

    const messages = [
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        ...history.slice(-8),
        {
            role: "user",
            content: userMessage
        }
    ];

    try {

        const completion =
            await openai.chat.completions.create({

                model: "openrouter/free",

                messages,

                temperature: 0.3,

                max_tokens: 700

            });

        const answer =
            getAnswer(completion);

        if (!answer) {

            console.error(
                "❌ OpenRouter boş cevap döndürdü:",
                JSON.stringify(completion)
            );

            throw new Error(
                "OpenRouter boş cevap döndürdü."
            );
        }

        memory.addMessage(
            userId,
            "user",
            userMessage
        );

        memory.addMessage(
            userId,
            "assistant",
            answer
        );

        return answer;

    } catch (error) {

        console.error(
            "❌ GPTPrime Hatası:",
            error
        );

        if (error.status === 401) {
            throw new Error(
                "OpenRouter API anahtarı geçersiz."
            );
        }

        if (error.status === 402) {
            throw new Error(
                "OpenRouter hesabında kullanılabilir kredi yok."
            );
        }

        if (error.status === 429) {
            throw new Error(
                "OpenRouter kullanım limitine ulaşıldı."
            );
        }

        throw error;
    }
}

module.exports = askAI;
