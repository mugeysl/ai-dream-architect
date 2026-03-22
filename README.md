# 🌙 AI Dream Architect (Rüya Mimarı)
### Future Talent Program 201 - Yapay Zeka Bitirme Projesi

**AI Dream Architect**, kullanıcıların rüyalarını derinlemesine analiz eden, duygusal yoğunlukları görselleştiren ve rüyanın atmosferine uygun sanatsal betimlemeler ile müzik önerileri sunan yapay zeka destekli bir platformdur.

---

## ✨ Öne Çıkan Özellikler

- **🧠 Gelişmiş AI Analizi:** En güncel **Gemini 2.5 Flash** modeli kullanılarak rüyaların psikolojik ve sembolik çözümü yapılır.
- **📊 Duygu Grafiği:** Rüyadaki 5 temel duygu (Mutluluk, Korku, Hüzün, Şaşkınlık, Güven) dinamik bir radar grafik ile görselleştirilir.
- **🔍 Sembol Sözlüğü:** Rüyadaki nesnelerin bilinçaltındaki anlamları tek tek ayıklanır.
- **🎨 Görsel ve İşitsel Kürasyon:** Rüyanın ambiyansını yansıtan sanatsal bir görsel istemi (prompt) ve ruh haline uygun müzik türü önerilir.
- **🛡️ Güvenli Mimari:** API anahtarları istemci tarafında (frontend) asla görünmez; **Vercel Serverless Functions** proxy yardımıyla güvenli bir iletişim sağlanır.

---

## 🛠️ Kullanılan Teknolojiler

- **Yapay Zeka:** Google Gemini 2.5 Flash (Generative AI API)
- **Frontend:** HTML5, Modern CSS (Glassmorphism & Responsive Design), Vanilla JavaScript
- **Backend/Proxy:** Node.js (Vercel Serverless Functions), ESM Modules
- **Veri Görselleştirme:** Chart.js
- **Yazı Tipleri:** Google Fonts (Inter, Outfit)

---

## 🏗️ Proje Yapısı

```text
├── api/
│   └── analyze.js      # Güvenli API Proxy katmanı (Vercel Function)
├── index.html          # Uygulama arayüzü
├── style.css           # Premium görsel tasarım ve animasyonlar
├── app.js              # Frontend mantığı ve AI yanıt yönetimi
├── server.js           # Yerel geliştirme ve test sunucusu
├── package.json        # Modern Node.js (Type: Module) yapılandırması
└── README.md           # Proje belgelendirmesi
```

---

## 🚀 Kurulum ve Çalıştırma

### Yerel Çalıştırma (Development)
1. `.env` dosyasına `GEMINI_API_KEY` değerinizi ekleyin.
2. Terminalde `node server.js` komutunu çalıştırın.
3. Tarayıcıda `http://localhost:3001` adresine gidin.

### Canlıya Alma (Deployment)
Proje Vercel ile tam uyumludur. GitHub'a push yapıldığında Vercel üzerinden Environment Variables kısmına `GEMINI_API_KEY` eklenerek anında yayına alınabilir.

---

## 📝 Notlar
Bu proje, sadece basit bir metin üreticisi değil; rüya tabirlerini modern psikolojik yaklaşımlar ve AI teknolojisiyle birleştiren "kat üstüne kat çıkılmış" bir çalışmadır.

**Geliştirici:** Müge Yişil  
**Canlı Link:** [ai-dream-architect.vercel.app](https://ai-dream-architect.vercel.app/)
