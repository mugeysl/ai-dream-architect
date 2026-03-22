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

    const MODEL_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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

        if (!response.ok) {
            return res.status(response.status).json({ error: `Gemini API Hatası: ${response.status}` });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error("Serverless Function Hatası:", error);
        return res.status(500).json({ error: 'Sunucu hatası oluştu.' });
    }
}
