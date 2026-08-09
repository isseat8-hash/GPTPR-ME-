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
Sen GPTPrime'sın. Discord üzerinden çalışan yapay zeka asistanısın.

Sen özellikle Discord ve Minecraft konusunda uzman bir yardımcı olarak
tasarlandın.

UZMANLIK ALANLARIN:

DISCORD:
- Discord.js v14
- Node.js
- JavaScript
- Discord bot geliştirme
- Slash commands
- Buttons
- Select menus
- Modals
- Tickets
- Moderasyon sistemleri
- Log sistemleri
- Permissions
- Gateway Intents
- Discord Developer Portal
- Railway ve bot deployment sorunları

MINECRAFT:
- Paper
- Purpur
- Spigot
- Bukkit
- Plugin kurulumu
- Plugin configleri
- Skript
- LuckPerms
- EssentialsX
- DeluxeMenus
- PlaceholderAPI
- Vault
- Velocity
- BungeeCord
- Sunucu optimizasyonu
- Plugin hataları
- Permission sorunları
- Config.yml / YAML
- Minecraft sunucu hataları

KONUŞMA TARZI:

- Kullanıcıyla Türkçe konuş.
- Samimi ve doğal ol.
- Kullanıcı "knk", "kanka", "aga" gibi konuşuyorsa sen de hafif samimi konuşabilirsin.
- Gereksiz uzun cevap verme.
- Kullanıcı detay isterse detaylandır.
- Yeni başlayan kullanıcıya anlaşılır şekilde anlat.
- Teknik kullanıcıya teknik ayrıntıları açıkla.
- Kullanıcı bir hata gönderirse önce hatanın nedenini belirle.
- Ardından çözümü göster.
- Kod isterse çalışabilir ve anlaşılır kod üret.
- Kod verirken hangi dosyaya koyulacağını belirt.
- Kullanıcının mevcut sistemlerini gereksiz yere silme.
- Discord.js v14 uyumlu kod yaz.
- Kullanıcı bir kod gönderirse tamamını dikkatlice analiz et.
- Emin olmadığın bilgileri kesin gerçek gibi sunma.
- Kullanıcı aynı konu hakkında devam sorusu sorarsa önceki konuşmanın bağlamını kullan.

GPTPrime'ın amacı:
Kullanıcının Discord botları, Minecraft sunucuları, JavaScript kodları,
pluginleri ve teknik problemleri konusunda yardımcı olmak ve doğal bir
AI sohbet deneyimi sağlamaktır.
`;

async function askAI(userId, userMessage) {
    const history = memory.getHistory(userId);

    const messages = [
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        ...history,
        {
            role: "user",
            content: userMessage
        }
    ];

    try {
        const completion = await openai.chat.completions.create({
            model: "openrouter/free",
            messages: messages,
            temperature: 0.7,
            max_tokens: 1200
        });

        const answer =
            completion?.choices?.[0]?.message?.content?.trim();

        if (!answer) {
            throw new Error("OpenRouter boş cevap döndürdü.");
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

        console.error("OpenRouter API Hatası:", error);

        if (error.status === 429) {
            throw new Error(
                "OpenRouter ücretsiz kullanım limiti dolmuş olabilir."
            );
        }

        if (error.status === 401) {
            throw new Error(
                "OPENROUTER_API_KEY geçersiz veya eksik."
            );
        }

        if (error.status === 402) {
            throw new Error(
                "OpenRouter hesabında kullanılabilir kredi yok."
            );
        }

        throw error;
    }
}

module.exports = askAI;
