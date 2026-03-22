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

    // Kullanıcının anahtarıyla uyumlu olduğu test edilen model
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

        if (!response.ok) {
            console.error("Gemini API Hatası:", data);
            return res.status(response.status).json({ 
                error: data.error?.message || `API Hatası: ${response.status}`,
                details: data 
            });
        }

        if (!data.candidates || data.candidates.length === 0) {
            return res.status(500).json({ error: "Yapay zeka rüyayı işleyemedi, lütfen tekrar deneyin." });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error("Serverless Function Hatası:", error);
        return res.status(500).json({ error: 'Sunucuyla iletişim kurulurken bir hata oluştu.' });
    }
}
