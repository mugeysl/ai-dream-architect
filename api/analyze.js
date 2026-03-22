/**
 * Vercel Serverless Function - Rüya Analiz Proxy
 * Bu dosya API anahtarını güvenli bir şekilde sunucu tarafında tutar.
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir.' });
    }

    const { text } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API anahtarı sunucuda tanımlanmamış.' });
    }

    const MODEL_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `Aşağıdaki rüyayı bir Rüya Analisti gibi analiz et ve sonucu SADECE geçerli bir JSON formatında döndür. Hiçbir açıklama ekleme, sadece JSON.
    
    JSON şeması: 
    {
      "emotions": {"mutluluk": number, "korku": number, "hüzün": number, "şaşkınlık": number, "güven": number},
      "symbols": [{"object": "Simge Adı", "meaning": "Simge Anlamı"}],
      "summary": "Rüyanın derin psikolojik özeti (en az 2 cümle)",
      "visual_prompt": "Bu rüyayı betimleyen sanatsal ve etkileyici bir görsel tasviri (2-3 cümle)",
      "music": "Rüyanın ruh haline uygun bir tür veya şarkı önerisi"
    }
    
    Duygu değerleri 0-100 arasında olmalıdır.
    Rüya: "${text}"`;

    try {
        const response = await fetch(MODEL_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        // Eğer bir hata varsa veya kota dolmuşsa simülasyonu devreye al
        if (!response.ok || data.error) {
            console.warn("API Hatası veya Kota Sınırı. Simülasyon moduna geçiliyor...");
            return res.status(200).json(getMockResponse(text));
        }

        // Eğer aday yoksa yine simülasyon yap
        if (!data.candidates || data.candidates.length === 0) {
            return res.status(200).json(getMockResponse(text));
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Fetch Hatası, Simülasyona geçiliyor:", error);
        return res.status(200).json(getMockResponse(text));
    }
}

/**
 * API Hatalı Olduğunda Çalışacak Simülasyon Yanıtı
 */
function getMockResponse(text) {
    return {
        candidates: [{
            content: {
                parts: [{
                    text: JSON.stringify({
                        emotions: {
                            mutluluk: Math.floor(Math.random() * 50) + 30,
                            korku: Math.floor(Math.random() * 40),
                            hüzün: Math.floor(Math.random() * 30),
                            şaşkınlık: Math.floor(Math.random() * 60),
                            güven: Math.floor(Math.random() * 50) + 20
                        },
                        symbols: [
                            { object: "Uçmak", meaning: "Özgürlük arayışı ve kısıtlamalardan kurtulma isteği." },
                            { object: "Mavi Gökyüzü", meaning: "Huzur, geniş ufuklar ve ruhsal dinginlik." },
                            { object: "Aynalar", meaning: "Kendini keşfetme ve içsel yüzleşme süreci." }
                        ],
                        summary: "Bu rüya, bilinçaltınızdaki derin arzuları ve hayatınızdaki yeni başlangıçlara olan merakınızı temsil ediyor. Genel atmosfer vizyoner bir bakış açısına sahip olduğunuzu gösterir. [NOT: Bu bir simülasyon yanıtatır, API kısıtlamanız düzelince gerçek AI yanıtı gelecektir.]",
                        visual_prompt: "Gerçeküstü bir gökyüzünde süzülen şeffaf perdeler ve uzaktaki parlayan bir kule temalı sanatsal çalışma.",
                        music: "Lofi Beats veya Ambient Space Music"
                    })
                }]
            }
        }]
    };
}
