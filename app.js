/**
 * Rüya Mimarı - Ana Uygulama Mantığı
 * Bu modül AI analizlerini yönetir ve arayüzü günceller.
 */

// UI Elementleri
const dreamInput = document.getElementById('dream-input');
const analyzeBtn = document.getElementById('analyze-btn');
const resetBtn = document.getElementById('reset-btn');
const inputSection = document.querySelector('.input-section');
const resultSection = document.getElementById('result-section');
const loader = document.getElementById('loader');
const symbolList = document.getElementById('symbol-list');
const dreamSummary = document.getElementById('dream-summary');
const visualPrompt = document.getElementById('visual-prompt');

let emotionChart = null;

// API Ayarları
// NOT: API anahtarı artık güvenlik nedeniyle sunucu tarafında (backend) tutulmaktadır.

/**
 * AI Analizini Başlat
 */
async function handleAnalyze() {
    const text = dreamInput.value.trim();
    if (text.length < 10) {
        alert("Lütfen biraz daha detaylı bir rüya anlatın (en az 10 karakter).");
        return;
    }

    // UI'ı loading durumuna getir
    inputSection.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        // Orijinal metni sonuç ekranına aktar
        document.getElementById('display-user-dream').innerText = text;

        const analysis = await getDreamAnalysis(text);
        displayResults(analysis);
    } catch (error) {
        console.error("Analiz hatası:", error);
        alert("Rüya analizi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
        inputSection.classList.remove('hidden');
    } finally {
        loader.classList.add('hidden');
    }
}

/**
 * Gemini AI API'den rüya analizini al
 */
async function getDreamAnalysis(text) {
    const API_URL = "/api/analyze";

    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text })
    });

    if (!response.ok) {
        throw new Error(`API Hatası: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.candidates || result.candidates.length === 0) {
        console.error("API Yanıtı boş veya geçersiz:", result);
        throw new Error("AI uygun bir yanıt oluşturamadı.");
    }

    const responseText = result.candidates[0].content.parts[0].text;
    
    try {
        // JSON bloğunu ayıkla (En dıştaki { } arasını al)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("JSON bloğu bulunamadı.");
        
        const cleanJson = jsonMatch[0];
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("JSON Ayrıştırma Hatası:", responseText);
        throw new Error("AI yanıtı beklenen formatta değil.");
    }
}

/**
 * Sonuçları Ekranda Göster
 */
function displayResults(data) {
    resultSection.classList.remove('hidden');
    
    // Sembolleri listele
    symbolList.innerHTML = '';
    data.symbols.forEach(item => {
        const li = document.createElement('li');
        li.className = 'symbol-item animate-in';
        li.innerHTML = `<strong>${item.object}</strong><span>${item.meaning}</span>`;
        symbolList.appendChild(li);
    });

    // Özeti ve görsel betimlemeyi yaz
    dreamSummary.innerText = data.summary;
    document.getElementById('visual-prompt').innerText = data.visual_prompt;

    // Müzik önerisini güncelle
    document.getElementById('music-recommendation').innerHTML = `<p>${data.music}</p>`;

    // Grafiği oluştur/güncelle
    initChart(data.emotions);
}

/**
 * Chart.js Radar Grafiği
 */
function initChart(emotions) {
    const ctx = document.getElementById('emotionChart').getContext('2d');

    if (emotionChart) {
        emotionChart.destroy();
    }

    const labels = Object.keys(emotions).map(e => e.charAt(0).toUpperCase() + e.slice(1));
    const values = Object.values(emotions);

    emotionChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Duygu Yoğunluğu',
                data: values,
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderColor: '#8b5cf6',
                borderWidth: 2,
                pointBackgroundColor: '#ec4899',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#ec4899'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: { color: '#94a3b8', font: { size: 12 } },
                    ticks: { display: false, stepSize: 20 },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: { display: false }
            },
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

/**
 * Uygulamayı Sıfırla
 */
function handleReset() {
    resultSection.classList.add('hidden');
    inputSection.classList.remove('hidden');
    dreamInput.value = '';
    if (emotionChart) emotionChart.destroy();
}

/**
 * Simüle edilmiş AI Yanıtı (Geliştirme ve Test İçin)
 */
async function mockAIResponse(text) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                emotions: {
                    mutluluk: Math.floor(Math.random() * 60),
                    korku: Math.floor(Math.random() * 80),
                    hüzün: Math.floor(Math.random() * 40),
                    şaşkınlık: Math.floor(Math.random() * 70),
                    güven: Math.floor(Math.random() * 50)
                },
                symbols: [
                    { object: "Uçmak", meaning: "Özgürlük arayışı ve kısıtlamalardan kurtulma isteği." },
                    { object: "Deniz", meaning: "Bilinçaltındaki derin duygular ve hayatın akışı." },
                    { object: "Anahtar", meaning: "Yeni fırsatlar veya gizli kalmış bilgilerin ortaya çıkması." }
                ],
                summary: "Bu rüya, hayatınızdaki belirsizliklere karşı duyduğunuz merakı ve özgürleşme arzunuzu simgeliyor. Gökyüzündeki semboller vizyoner bir bakış açısına sahip olduğunuzu gösterir.",
                visual_prompt: "Lacivert bir gökyüzünde parlayan altın anahtarlar ve bulutların üzerinde süzülen bir silüet."
            });
        }, 2000);
    });
}

const downloadBtn = document.getElementById('download-btn');

// Event Listeners
analyzeBtn.addEventListener('click', handleAnalyze);
resetBtn.addEventListener('click', handleReset);
downloadBtn.addEventListener('click', () => {
    window.print();
});

// Yıldızları oluştur (Arka plan süslemesi)
function createStars() {
    const starsContainer = document.querySelector('.stars-container');
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.style.position = 'absolute';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.backgroundColor = 'white';
        star.style.borderRadius = '50%';
        star.style.opacity = Math.random();
        star.style.boxShadow = `0 0 ${Math.random() * 10}px white`;
        starsContainer.appendChild(star);
    }
}

createStars();
console.log("Rüya Mimarı başlatıldı!");
