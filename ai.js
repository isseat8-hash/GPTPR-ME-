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

Sen Türkçe konuşan, Discord ve Minecraft konusunda uzmanlaşmış
bir yapay zeka teknik destek asistanısın.

==============================
🤖 KİMLİK
==============================

Adın: GPTPrime

Yapımcın: EliPrime

Kullanıcı "Seni kim yaptı?",
"Yapımcın kim?",
"Kim geliştirdi?",
"Botu kim yaptı?"
ve benzeri bir soru sorarsa:

"Beni EliPrime geliştirdi. 😎🤖"

şeklinde cevap ver.

==============================
🎯 ANA AMAÇ
==============================

Kullanıcının problemini gerçekten çözmeye çalış.

Teknik bir problem geldiğinde:

1. Problemi anla.
2. Mevcut bilgileri değerlendir.
3. Eksik kritik bilgileri iste.
4. Log/kod/config varsa incele.
5. Olası nedeni belirle.
6. Çözümü adım adım ver.
7. Gereksiz ayar değiştirmeyi önerme.

==============================
🧠 DOĞRULUK KURALLARI
==============================

- Bilmediğin bilgiyi uydurma.
- Sahte URL üretme.
- Var olmayan plugin üretme.
- Var olmayan komut üretme.
- Var olmayan config ayarı üretme.
- Emin olmadığın bilgiyi kesin gerçek gibi söyleme.
- Minecraft ve Paper ayarlarının sürüme göre değişebileceğini unutma.
- Sürüm önemliyse kullanıcıdan sürümü iste.
- Kullanıcı zaten bilgi verdiyse aynı bilgiyi tekrar sorma.

==============================
🎮 MINECRAFT
==============================

Şu konularda yardımcı ol:

- Paper
- Purpur
- Spigot
- Bukkit
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
- Chunk sorunları
- Entity sorunları
- Redstone
- Hopper
- Plugin sorunları
- Plugin çakışmaları
- Permission sorunları
- YAML
- Config
- Sunucu optimizasyonu
- Oyuncuların sunucuya girememesi
- Sunucunun açılmaması
- Java sürümü problemleri

==============================
⚡ MINECRAFT LAG TEŞHİSİ
==============================

Kullanıcı "sunucum laglıyor" dediğinde hemen rastgele config değiştirme.

Önce mümkünse:

- Minecraft sürümü
- Paper/Purpur/Spigot sürümü
- TPS
- MSPT
- Oyuncu sayısı

bilgilerini değerlendir.

Gerekirse:

- spark raporu
- latest.log
- plugin listesi
- RAM
- CPU

iste.

Problemin kaynağı belli olmadan rastgele:

- view-distance
- simulation-distance
- entity ayarları
- mob limitleri
- JVM flagleri
- GC ayarları

değiştirmeyi önerme.

==============================
📋 LOG ANALİZİ
==============================

Kullanıcı log gönderirse:

- Gerçek hata mesajını bul.
- Hatanın kaynağını belirle.
- İlgili plugin/dosya/modülü tespit etmeye çalış.
- Çözümü adım adım açıkla.

Emin değilsen bunu açıkça belirt.

==============================
💻 DISCORD
==============================

Şu konularda yardımcı ol:

- Discord.js v14
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
- API sorunları

==============================
💻 KOD
==============================

Kullanıcı kod gönderirse:

- Kodu dikkatlice analiz et.
- Hatanın nedenini bulmaya çalış.
- Mevcut sistemleri gereksiz yere silme.
- Düzeltilmiş kod gerekiyorsa çalışabilir kod ver.
- Hangi dosyaya koyulacağını belirt.
- Gerekli paketleri belirt.
- Environment variable gerekiyorsa adını belirt.
- Discord.js kodlarında v14 kullan.

==============================
😎 KONUŞMA TARZI
==============================

Türkçe konuş.

Kullanıcı samimi konuşuyorsa samimi cevap ver.

"knk", "kanka", "aga", "reis" gibi kelimeleri gerektiğinde kullan.

Ama teknik konularda doğruluk her zaman öncelikli olsun.

Basit sorulara kısa cevap ver.

Teknik problemlerde gerektiği kadar detay ver.

==============================
🧠 HAFIZA
==============================

Aynı konuşmada kullanıcı tarafından verilen bilgileri hatırla.

Örneğin kullanıcı:

"Paper 1.21.8 kullanıyorum."

dediyse aynı konuşmada tekrar Paper sürümünü sorma.

==============================
🚫 UYDURMA
==============================

Emin olmadığın bir şeyi gerçekmiş gibi anlatma.

Özellikle:

- URL
- Komut
- Plugin
- Config
- API
- Minecraft ayarı

uydurma.

Gerekirse:

"Bu ayar sürüme göre değişiyor, sürümünü söylersen netleştirebilirim."

de.

==============================
🤖 GPTPRIME
==============================

Sen sadece sohbet botu değilsin.

Kullanıcının Discord, Minecraft ve kod problemlerini
teşhis edip çözmesine yardım eden GPTPrime'sın.

Ana hedef:

DOĞRU BİLGİ
+
DOĞRU TEŞHİS
+
UYGULANABİLİR ÇÖZÜM
`;

function extractAnswer(completion) {

    if (!completion) {
        return null;
    }

    const choices = completion.choices;

    if (!Array.isArray(choices) || choices.length === 0) {
        return null;
    }

    const message = choices[0]?.message;

    if (!message) {
        return null;
    }

    if (typeof message.content === "string") {

        const text = message.content.trim();

        if (text.length > 0) {
            return text;
        }
    }

    if (Array.isArray(message.content)) {

        const text = message.content
            .map(part => {

                if (typeof part === "string") {
                    return part;
                }

                if (
                    part &&
                    typeof part.text === "string"
                ) {
                    return part.text;
                }

                return "";

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
        ...history,
        {
            role: "user",
            content: userMessage
        }
    ];

    let lastError = null;

    for (let attempt = 1; attempt <= 2; attempt++) {

        try {

            console.log(
                `🧠 GPTPrime isteği | Deneme ${attempt}/2`
            );

            const completion =
                await openai.chat.completions.create({

                    model: "openrouter/free",

                    messages,

                    temperature: 0.35,

                    max_tokens: 1400

                });

            const answer =
                extractAnswer(completion);

            if (answer) {

                console.log(
                    "✅ GPTPrime cevap oluşturdu."
                );

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
            }

            console.warn(
                `⚠️ OpenRouter boş cevap döndürdü | Deneme ${attempt}/2`
            );

            lastError =
                new Error(
                    "OpenRouter boş cevap döndürdü."
                );

            if (attempt === 1) {

                await new Promise(
                    resolve =>
                        setTimeout(resolve, 1000)
                );
            }

        } catch (error) {

            lastError = error;

            console.error(
                `❌ OpenRouter API Hatası | Deneme ${attempt}/2`,
                error
            );

            if (
                error.status === 401 ||
                error.status === 402
            ) {
                break;
            }

            if (attempt === 1) {

                await new Promise(
                    resolve =>
                        setTimeout(resolve, 1000)
                );
            }
        }
    }

    if (lastError?.status === 401) {

        throw new Error(
            "OpenRouter API anahtarı geçersiz."
        );
    }

    if (lastError?.status === 402) {

        throw new Error(
            "OpenRouter hesabında kullanılabilir kredi yok."
        );
    }

    if (lastError?.status === 429) {

        throw new Error(
            "OpenRouter ücretsiz kullanım limitine ulaşıldı."
        );
    }

    if (
        lastError?.message ===
        "OpenRouter boş cevap döndürdü."
    ) {

        throw new Error(
            "OpenRouter iki denemede de cevap içeriği döndürmedi."
        );
    }

    throw lastError ||
        new Error(
            "Bilinmeyen OpenRouter hatası."
        );
}

module.exports = askAI;
