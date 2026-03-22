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
    // Statik dosya servisi
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
            case '.svg': contentType = 'image/svg+xml'; break;
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
                    throw new Error("GEMINI_API_KEY bulunamadı.");
                }

                // Denenecek modeller
                const MODELS = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-pro"];
                
                const prompt = `Aşağıdaki rüyayı rüya analisti gibi analiz et ve sadece JSON dön: "${text}"`;

                let success = false;
                for (const model of MODELS) {
                    try {
                        console.log(`Yerel sunucu deniyor: ${model}`);
                        const result = await callGemini(model, GEMINI_API_KEY, prompt);
                        if (result) {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify(result));
                            success = true;
                            break;
                        }
                    } catch (e) {
                        console.error(`${model} hata: ${e.message}`);
                    }
                }

                if (!success) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: "Tüm modeller başarısız oldu." }));
                }

            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    }
});

async function callGemini(model, key, prompt) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${model}:generateContent?key=${key}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };

        const apiReq = https.request(options, (apiRes) => {
            let data = '';
            apiRes.on('data', (d) => { data += d; });
            apiRes.on('end', () => {
                const parsed = JSON.parse(data);
                if (apiRes.statusCode === 200 && !parsed.error) {
                    resolve(parsed);
                } else {
                    reject(new Error(parsed.error?.message || "Bilinmeyen hata"));
                }
            });
        });

        apiReq.on('error', reject);
        apiReq.write(JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }));
        apiReq.end();
    });
}

server.listen(PORT, () => {
    console.log(`\n🌙 Yerel Sunucu: http://localhost:${PORT}`);
});
