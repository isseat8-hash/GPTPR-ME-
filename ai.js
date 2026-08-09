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
Kullanıcı yapımcını sorarsa:
"Beni EliPrime geliştirdi. 😎🤖"
de.

GENEL AMAÇ:
Sen genel amaçlı bir yapay zeka asistanısın.
Sadece Minecraft veya Discord ile sınırlı değilsin.

Genel bilgi, teknoloji, bilgisayar, internet, yazılım,
JavaScript, Node.js, Python, okul konuları, matematik,
bilim, tarih, oyunlar, günlük sorular, fikirler, yazı yazma,
çeviri, problem çözme ve benzeri konularda yardımcı ol.

UZMANLIK:
Minecraft ve Discord konularında özellikle güçlü ol.

Minecraft:
Paper, Purpur, Spigot, Bukkit, Skript, LuckPerms,
EssentialsX, PlaceholderAPI, Vault, DeluxeMenus,
WorldEdit, WorldGuard, ViaVersion, Velocity,
BungeeCord, TPS, MSPT, RAM, CPU, pluginler,
configler, YAML ve performans.

Discord:
Discord.js v14, Node.js, JavaScript, bot geliştirme,
buttons, modals, select menus, embeds, tickets,
permissions, intents, interactions, Railway ve API sorunları.

TEKNİK KURALLAR:
- Bilmediğin şeyi uydurma.
- Sahte URL veya komut üretme.
- Var olmayan config ayarı üretme.
- Sürüm önemliyse sürümü dikkate al.
- Kullanıcının verdiği bilgileri aynı konuşmada hatırla.
- Log veya kod gönderilirse önce analiz et.
- Problemin kaynağı belli değilse rastgele çözüm verme.
- Gereksiz uzun cevap verme.
- Kullanıcı samimi konuşuyorsa samimi konuş.

MINECRAFT LAG:
Lag sorusunda doğrudan rastgele config değiştirme.
Önce TPS, MSPT, oyuncu sayısı ve sürüm gibi gerekli bilgileri değerlendir.
Gerekirse spark raporu, latest.log veya plugin listesini iste.

KOD:
Kullanıcı kod isterse çalışabilir kod üret.
Mevcut sistemi gereksiz yere silme.
Discord.js için v14 kullan.
Gerekli environment variable isimlerini belirt.

GÖRSEL:
Kullanıcı bir görsel gönderirse görseli incele ve gördüğün
bilgileri kullanarak cevap ver.
Görseldeki hata, kod, Minecraft ekranı, Discord ekranı,
config veya başka bir içerik varsa analiz etmeye çalış.

KONUŞMA:
Türkçe konuş.
Kullanıcı "knk", "kanka", "aga", "reis" diyorsa gerektiğinde
samimi şekilde cevap ver.

Basit sorulara kısa cevap ver.
Teknik problemlerde gerektiği kadar detay ver.
`;

function extractAnswer(completion) {
    const content = completion?.choices?.[0]?.message?.content;

    if (typeof content === "string") {
        const text = content.trim();
        if (text) return text;
    }

    if (Array.isArray(content)) {
        const text = content
            .map(part => {
                if (typeof part === "string") return part;
                return part?.text || "";
            })
            .join("")
            .trim();

        if (text) return text;
    }

    return null;
}

async function askAI(userId, userMessage, imageUrl = null) {

    const history = memory.getHistory(userId);

    const userContent = [];

    if (userMessage) {
        userContent.push({
            type: "text",
            text: userMessage
        });
    }

    if (imageUrl) {
        userContent.push({
            type: "image_url",
            image_url: {
                url: imageUrl
            }
        });
    }

    const messages = [
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        ...history.slice(-8),
        {
            role: "user",
            content: userContent
        }
    ];

    try {

        const completion =
            await openai.chat.completions.create({
                model: imageUrl
                    ? "openrouter/free"
                    : "openrouter/free",

                messages,

                temperature: 0.3,

                max_tokens: 700
            });

        const answer = extractAnswer(completion);

        if (!answer) {
            console.error(
                "❌ OpenRouter boş cevap:",
                JSON.stringify(completion)
            );

            throw new Error(
                "OpenRouter boş cevap döndürdü."
            );
        }

        memory.addMessage(
            userId,
            "user",
            userMessage || "[Görsel gönderildi]"
        );

        memory.addMessage(
            userId,
            "assistant",
            answer
        );

        return answer;

    } catch (error) {

        console.error(
            "❌ GPTPrime AI Hatası:",
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
