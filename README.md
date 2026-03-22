# 🌙 Rüya Mimarı (AI Dream Architect) - Kurulum ve Yayına Alma

Bu proje, Future Talent 201 Yapay Zeka Bitirme Projesi için hazırlanmıştır.

## 🚀 Hızlı Kurulum
Projeyi yerel bilgisayarınızda çalıştırmak için:
1. Proje klasörüne gidin.
2. Terminalde `npx serve .` komutunu çalıştırın (Veya herhangi bir yerel sunucu kullanın).
3. Tarayıcıda `http://localhost:3000` adresini açın.

## 🔑 AI Analizini Aktif Etme (Gerçek API)
Uygulama şu an geliştirme (mock) modundadır. Gerçek Gemini API'sini bağlamak için:
1. `app.js` dosyasını açın.
2. `const GEMINI_API_KEY = "";` satırına kendi API anahtarınızı ekleyin.
3. `getDreamAnalysis` fonksiyonundaki fetch isteğini aktif hale getirin.

## 🚀 Canlıya Alma (Deployment - Vercel)

Bu proje, API anahtarınızı güvenli bir şekilde saklamak için **Vercel Serverless Functions** mimarisini kullanır. Uygulamayı canlıya alırken şu adımları izleyin:

1.  Projenizi GitHub'a yükleyin.
2.  [Vercel](https://vercel.com) hesabınıza girin ve "New Project" diyerek deponuzu seçin.
3.  **Deployment Settings** kısmında **Environment Variables** bölümüne gidin:
    *   `Key`: `GEMINI_API_KEY`
    *   `Value`: `(Sizin API Anahtarınız)`
4.  "Deploy" butonuna basın.

Artık uygulamanız canlıda! API anahtarınız GitHub'da veya tarayıcıda asla görünmez, sadece Vercel sunucularında güvenle saklanır.

## 🛠️ Yerel Geliştirme

Yerel olarak API'yi test etmek için:
1. `vercel dev` komutunu kullanabilirsiniz (Vercel CLI yüklüyse).
2. Veya manuel test için `app.js` içine geçici olarak anahtarınızı ekleyebilirsiniz (ancak commit etmeyin!).

## 📄 Dosya Yapısı
- `index.html`: Uygulamanın iskeleti.
- `style.css`: Modern Glassmorphism tasarımı.
- `app.js`: AI mantığı ve grafik yönetimi.
- `assets/`: (Gerekirse) Resimler ve ikonlar.
