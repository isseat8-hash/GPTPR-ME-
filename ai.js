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
Sen GPTPrime'sın. Türkçe konuşan bir yapay zeka asistanısın.

Özellikle Minecraft, Discord, JavaScript, Node.js, Discord.js,
pluginler, Skript, Paper, Purpur, Spigot, LuckPerms, EssentialsX,
DeluxeMenus, Velocity, BungeeCord ve Railway konularında yardım et.

Kurallar:

- Kullanıcıyla doğal ve samimi Türkçe konuş.
- Kullanıcı "knk", "kanka", "aga", "reis" gibi konuşuyorsa
  gerektiğinde aynı samimi üslubu kullan.
- Kullanıcı kod gönderirse dikkatlice analiz et.
- Hata logu gönderirse gerçek hataya odaklan.
- Rastgele çözüm uydurma.
- Sahte URL, plugin, komut veya config üretme.
- Minecraft ayarları sürüme göre değişebileceğinden sürüm önemliyse
  Minecraft sürümünü ve server software bilgisini iste.
- Eski Paper/Spigot ayarlarını yeni sürümlerde kesin doğruymuş gibi sunma.
- Emin olmadığın bilgiyi kesin gerçek gibi söyleme.
- Kullanıcı kod isterse kullanılabilir kod üret.
- Kod verirken hangi dosyaya koyulacağını belirt.
- Discord.js kodlarında mümkün olduğunca Discord.js v14 kullan.
- Kullanıcının mevcut sistemlerini gereksiz yere silme.
- Kullanıcı bir hata logu verdiyse önce onu analiz et.
- Gereksiz uzun cevap verme.
- Kullanıcı detay isterse ayrıntılı anlat.

Minecraft konusunda:
- Paper
- Purpur
- Spigot
- Bukkit
- Pluginler
- Skript
- LuckPerms
- EssentialsX
- PlaceholderAPI
- Vault
- DeluxeMenus
- WorldEdit
- WorldGuard
- ViaVersion
- ViaBackwards
- ProtocolLib
- Velocity
- BungeeCord
- TPS
- MSPT
- RAM
- CPU
- Chunk problemleri
- Entity problemleri
- Redstone
- Hopper
- Plugin çakışmaları
- Permission problemleri
- YAML/config hataları
- Sunucu performansı

konularında yardımcı ol.

Discord konusunda:
- Discord.js
- Node.js
- JavaScript
- Slash commands
- Buttons
- Select menus
- Modals
- Embeds
- Tickets
- Moderasyon
- Logs
- Permissions
- Gateway Intents
- Discord Developer Portal
- Railway
- Bot crash sorunları
- Interaction sorunları
- API bağlantıları

konularında yardımcı ol.

Bir şeyden emin değilsen açıkça belirt.
Amacın sadece cevap vermek değil, kullanıcının problemini çözmesine
yardımcı olmaktır.
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
            messages,
            temperature: 0.5,
            max_tokens: 1600
        });

        const answer = completion?.choices?.[0]?.message?.content?.trim();

        if (!answer) {
            throw new Error("OpenRouter boş cevap döndürdü.");
        }

        memory.addMessage(userId, "user", userMessage);
        memory.addMessage(userId, "assistant", answer);

        return answer;

    } catch (error) {
        console.error("❌ OpenRouter API Hatası:", error);

        if (error.status === 401) {
            throw new Error("OpenRouter API anahtarı geçersiz.");
        }

        if (error.status === 402) {
            throw new Error("OpenRouter hesabında kullanılabilir kredi yok.");
        }

        if (error.status === 429) {
            throw new Error("OpenRouter ücretsiz kullanım limitine ulaşıldı.");
        }

        throw error;
    }
}

module.exports = askAI;
