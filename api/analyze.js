/**
 * Vercel Serverless Function - Rüya Analiz Proxy
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

    // Kota sorunlarını aşmak için denenecek modeller (Öncelik sırasına göre)
    const MODELS = [
        "gemini-2.5-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-2.0-flash-lite",
        "gemini-pro"
    ];

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

    let lastError = null;

    for (const model of MODELS) {
        try {
            console.log(`Model deneniyor: ${model}`);
            const MODEL_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
            
            const response = await fetch(MODEL_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();

            if (response.ok && data.candidates && data.candidates.length > 0) {
                console.log(`Başarılı model: ${model}`);
                return res.status(200).json(data);
            }

            lastError = data.error?.message || `API Hatası (${model}): ${response.status}`;
            console.warn(`${model} başarısız oldu: ${lastError}`);
            
            // Eğer 404 (model bulunamadı) veya 429 (quota) ise bir sonrakine geç
            continue; 

        } catch (error) {
            lastError = error.message;
            console.error(`${model} sistem hatası:`, error);
        }
    }

    // Hiçbir model çalışmadıysa
    return res.status(500).json({ 
        error: "Şu an tüm yapay zeka hatları dolu. Lütfen biraz sonra tekrar deneyin.",
        details: lastError 
    });
}
