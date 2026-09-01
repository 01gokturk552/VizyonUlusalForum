# Geliştirme Rehberi

Bu dosya Vizyon Ulusal Forum projesini lokal ortamda çalıştırmak ve geliştirmek isteyenler için adım adım rehber sunmaktadır.

---

## 🔧 Lokal Kurulum

### 1. Gereksinimler
- Node.js 14.0+ ([İndir](https://nodejs.org))
- npm 6.0+ (Node.js ile birlikte gelir)
- Git ([İndir](https://git-scm.com))
- Bir metin editörü (VS Code, Sublime, vb.)
- Gmail hesabı (backend e-mail servisi için)

### 2. Proje Dosyalarını Klonla
```bash
git clone https://github.com/yourusername/vizyon-ulusal-forum.git
cd vizyon-ulusal-forum
```

### 3. Bağımlılıkları Yükle
```bash
npm install
```

### 4. Ortam Dosyasını Oluştur
```bash
# .env.example'ı .env olarak kopyala
cp .env.example .env
```

### 5. .env Dosyasını Düzenle
`.env` dosyasını açıp aşağıdaki bilgileri gir:

```env
# Gmail E-posta Bilgileri
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Sunucu Portu
PORT=3000

# CORS İzinleri (geliştirmede * kullanabilirsin)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

**Gmail Setup Rehberi:**
1. [Google Account](https://myaccount.google.com) adresine git
2. Sol tarafta "Security" (Güvenlik) seçeneğini tıkla
3. "App passwords" (Uygulama Şifreleri) seçeneğini tıkla
4. "Gmail" ve "Windows Computer" seçerek şifre oluştur
5. Oluşturulan 16 karakterlik şifreyi `EMAIL_PASS` olarak `.env`'ye ekle

---

## 🚀 Sunucuyu Başlat

### Geliştirme Modu (Recommended)
```bash
npm run dev
```

Çıktı:
```
═══════════════════════════════════════════════════════════
🚀 Vizyon Ulusal Forum Backend Başlatıldı
📍 URL: http://localhost:3000
⏰ Saat: 1.09.2026 10:30:45
═══════════════════════════════════════════════════════════
```

### Üretim Modu
```bash
npm start
```

---

## 🧪 Sunucuyu Test Et

### Health Check
```bash
curl http://localhost:3000/api/health
```

**Beklenen Yanıt:**
```json
{
  "status": "ok",
  "message": "Backend çalışıyor",
  "timestamp": "2026-09-01T10:30:00.000Z",
  "version": "1.0.0"
}
```

### E-posta Gönderme Test'i
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "type": "approve",
    "data": {
      "commission": "Ekonomi Komisyonu",
      "fee": 650,
      "dekontEmail": "payment@example.com",
      "paymentName": "Test Kişi",
      "iban": "TR12 XXXX XXXX XXXX XXXX XXXX XX",
      "name": "Test Katılımcı"
    }
  }'
```

---

## 📁 Proje Dosya Yapısı

```
vizyon-ulusal-forum/
│
├── 📄 Frontend Dosyaları
│   ├── index.html              # Ana sayfa (Hero, Bilgiler, vb)
│   ├── basvuru.html            # Başvuru formları
│   ├── ekibimiz.html           # Ekip tanıtımı
│   ├── admin-login.html        # Admin login
│   ├── admin-panel.html        # Admin dashboard
│   ├── ik-login.html           # IK login
│   └── ik-panel.html           # IK dashboard
│
├── 🎨 Stil Dosyaları
│   ├── style.css               # Global stiller
│   └── basvuru.css             # Başvuru sayfası stilleri
│
├── ⚙️ Backend Dosyaları
│   ├── server.js               # Express sunucusu
│   ├── package.json            # Proje metaveri
│   └── .env                    # Ortam değişkenleri (⚠️ .gitignore'da)
│
├── 📚 Dokümantasyon
│   ├── README.md               # Proje hakkında
│   ├── CONTRIBUTING.md         # Katkı rehberi
│   ├── DEVELOPMENT.md          # Bu dosya
│   └── .env.example            # Ortam değişkenleri template
│
├── 🔧 Git/Konfigürasyon
│   ├── .gitignore              # Git ignore kuralları
│   ├── .git/                   # Git repository
│   └── vizyonulusalforum.png   # Logo
```

---

## 💻 Frontend Geliştirme

### HTML Dosyaları Düzenle
Frontend dosyaları `.html` formatındadır:
- Tarayıcıda doğrudan açabilirsin: `File → Open` veya `Ctrl+O`
- Veya lokal sunucu ayarla: `python -m http.server 8000`

### CSS Değişiklikleri
- `style.css` - Tüm sayfalarda kullanılan global stiller
- `basvuru.css` - Başvuru sayfasına özel stiller

### JavaScript
- HTML dosyalarının içinde `<script>` tag'ları vardır
- Inline JavaScript yerine dış dosyalara taşımayı düşün (best practice)

---

## 🔌 Backend Geliştirme

### server.js Yapısı

```javascript
// 1. Dependencies import
require('dotenv').config();
const express = require('express');

// 2. App initialization
const app = express();

// 3. Middleware setup
app.use(cors());
app.use(express.json());

// 4. Route handlers
app.post('/api/send-email', async (req, res) => { /* ... */ });

// 5. Error handling
app.use(errorHandler);

// 6. Server start
app.listen(PORT);
```

### Yeni API Endpoint Ekle

```javascript
// Örnek: Başvuruları getir
app.get('/api/basvurular', (req, res) => {
  try {
    // Admin doğrulama yapılmalı
    const basvurular = []; // veritabanından al
    res.json({ success: true, data: basvurular });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Günlükleme (Logging)
```javascript
// Server otomatik olarak log tutuyor:
// ✓ E-posta gönderimi
// ❌ Hatalar
// [ISO-TIMESTAMP] METHOD PATH
```

---

## 🐛 Debugging

### Console Çıktısını Kontrol Et
Backend çalışırken terminal/console'a dikkat et:

```
[2026-09-01T10:30:00.000Z] POST /api/send-email
✓ E-posta gönderildi: test@example.com (Tür: approve)
```

### Browser DevTools
Frontend'i debug etmek için:
1. Tarayıcı aç
2. `F12` veya `Ctrl+Shift+I` ile DevTools aç
3. Console tab'ında hatalar kontrol et
4. Network tab'ında API isteklerini gör

### VS Code Debugging
`.vscode/launch.json` oluştur:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server.js",
      "restart": true,
      "console": "integratedTerminal"
    }
  ]
}
```

---

## 📦 npm Komutları

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme modu (otomatik reload)
npm run dev

# Üretim modu
npm start

# Güvenlik denetimi
npm audit

# Güncellemeleri kontrol et
npm outdated
```

---

## 🔐 Güvenlik Kontrol Listesi

Geliştirme sırasında kontrol et:

- ✅ `.env` dosyası `.gitignore`'da mı?
- ✅ Gizli bilgiler koda embed edilmedi mi?
- ✅ E-mail validasyonu yapılıyor mu?
- ✅ Kullanıcı girdileri sanitize ediliyor mu?
- ✅ Error detayları güvenli şekilde sunuluyor mu?

---

## 🚀 Deployment (Üretim)

### Heroku Deploy Örneği
```bash
# Heroku CLI yükle
npm install -g heroku

# Giriş yap
heroku login

# App oluştur
heroku create your-app-name

# Environment değişkenleri set et
heroku config:set EMAIL_USER=your@gmail.com
heroku config:set EMAIL_PASS=your-password

# Deploy et
git push heroku main
```

### Vercel Deploy
```bash
npm install -g vercel
vercel
```

---

## ❓ Sık Sorulan Sorular

### S: Sunucu başlamıyor, "port already in use" hatası
**C:** Başka uygulamaya kullan:
```bash
PORT=3001 npm start
```

### S: E-postalar gönderilmiyor
**C:** 
1. `.env` dosyasını kontrol et
2. Gmail App Password doğru mu?
3. 2-factor authentication açık mı?

### S: Frontend değişiklikleri yansımıyor
**C:** 
- Tarayıcı cache'i temizle: `Ctrl+Shift+Delete`
- Hard refresh yap: `Ctrl+F5`

### S: Backend ve frontend'i ayırabilir miyim?
**C:** Evet! Frontend static dosya sunabilir:
```bash
npm install express-static-gzip
```

---

## 📚 Faydalı Kaynaklar

- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [GitHub Guides](https://guides.github.com/)
- [Nodemailer Docs](https://nodemailer.com/)

---

## 📞 Destek

Sorun yaşarsan:
1. GitHub Issues'e rapor et
2. CONTRIBUTING.md oku
3. Koordinatörlere ulaş:
   - Yiğit Efe SEVİR: 0546 926 2010
   - Ada Nehir ŞAHİN: 0501 012 58 60

---

**Son Güncelleme:** 2026-09-01
