import http from 'http';
import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env dosyasını yükle
dotenv.config();

const PORT = 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const server = http.createServer(async (req, res) => {
    // Statik dosya servisi (index.html, style.css, app.js vb.)
    if (req.method === 'GET') {
        let filePath = req.url === '/' ? './index.html' : '.' + req.url;
        const extname = path.extname(filePath);
        let contentType = 'text/html';
        
        switch (extname) {
            case '.js': contentType = 'text/javascript'; break;
            case '.css': contentType = 'text/css'; break;
            case '.json': contentType = 'application/json'; break;
            case '.png': contentType = 'image/png'; break;
            case '.jpg': contentType = 'image/jpg'; break;
        }

        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(404);
                res.end("Dosya bulunamadı.");
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }

    // API Analiz Endpoint'i (Vercel Proxy Simülasyonu)
    else if (req.method === 'POST' && req.url === '/api/analyze') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { text } = JSON.parse(body);
                if (!GEMINI_API_KEY) {
                    throw new Error("GEMINI_API_KEY .env dosyasında bulunamadı.");
                }

                console.log("Analiz isteği geldi, Gemini API'ye bağlanılıyor...");
                
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

                const options = {
                    hostname: 'generativelanguage.googleapis.com',
                    path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                };

                const apiReq = https.request(options, (apiRes) => {
                    let data = '';
                    apiRes.on('data', (d) => { data += d; });
                    apiRes.on('end', () => {
                        res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
                        res.end(data);
                    });
                });

                apiReq.on('error', (e) => { throw e; });
                apiReq.write(JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }));
                apiReq.end();

            } catch (err) {
                console.error("Local Server Hatası:", err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    }
});

server.listen(PORT, () => {
    console.log(`\n🌙 Rüya Mimarı Yerel Test Sunucusu Başlatıldı!`);
    console.log(`-------------------------------------------`);
    console.log(`👉 Adres: http://localhost:${PORT}`);
    console.log(`👉 Durum: .env dosyasındaki API key kullanılıyor.`);
});
