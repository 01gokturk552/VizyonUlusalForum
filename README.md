# II. Vizyon Ulusal Forum 2026

Türkiye'nin en büyük bağımsız ulusal forum etkinliği. Gençlerin sesi, Türkiye'nin geleceği.

🌐 **Website:** [vizyonulusalforum.com](https://vizyonulusalforum.com)

---

## 📋 İçindekiler

- [Proje Hakkında](#proje-hakkında)
- [Özellikler](#özellikler)
- [Teknoloji Stack'i](#teknoloji-stacki)
- [Kurulum](#kurulum)
- [Başlatma](#başlatma)
- [API Endpoints](#api-endpoints)
- [Proje Yapısı](#proje-yapısı)
- [Katkı Yapma](#katkı-yapma)
- [Lisans](#lisans)

---

## 🎯 Proje Hakkında

Vizyon Ulusal Forum, lise öğrencilerinin geleceğe ilişkin fikirlerini üretip, müzakere edebilecekleri ve liderlik yeteneklerini keşfedebilecekleri profesyonel bir platform sunmaktadır.

Etkinlik 9 farklı komisyonda gerçekleştirilmekte ve 270+ katılımcıyı bir araya getirmektedir.

**Tarih:** 19-20 Eylül 2026

---

## ✨ Özellikler

- ✅ Profesyonel başvuru sistemi
- ✅ Bireysel delege ve okul delegasyonu başvuruları
- ✅ Dinamik form yönetimi
- ✅ Admin panel ve IK panel
- ✅ E-posta bildirimleri (onay/ret)
- ✅ Responsive tasarım
- ✅ Modern ve profesyonel UI

---

## 🛠 Teknoloji Stack'i

### Frontend
- HTML5
- CSS3 (Modern Design System)
- JavaScript (ES6+)
- Font Awesome Icons
- Google Fonts

### Backend
- Node.js
- Express.js
- Nodemailer (E-posta Gönderimi)
- CORS Middleware
- dotenv (Ortam Değişkenleri)

### DevOps
- Git & GitHub
- npm Package Manager

---

## 📦 Kurulum

### Gereksinimler
- Node.js 14.0 veya üzeri
- npm 6.0 veya üzeri
- Git

### Adımlar

1. **Repository'yi klonla:**
```bash
git clone https://github.com/yourusername/vizyon-ulusal-forum.git
cd vizyon-ulusal-forum
```

2. **Bağımlılıkları yükle:**
```bash
npm install
```

3. **Ortam değişkenlerini yapılandır:**
```bash
# .env.example dosyasını .env olarak kopyala
cp .env.example .env

# .env dosyasını düzenle ve gerekli bilgileri ekle
nano .env
```

**Gerekli Ortam Değişkenleri:**
- `EMAIL_USER`: Gmail adresi (E-posta gönderimi için)
- `EMAIL_PASS`: Google App Password
- `PORT`: Backend sunucusu portu (default: 3000)
- `ALLOWED_ORIGINS`: CORS'a izin verilecek originler (optional)

> **Gmail Kurulumu:**
> 1. [Google Account](https://myaccount.google.com) adresine git
> 2. Security → App passwords
> 3. Gmail ve Windows Select et
> 4. Oluşturulan parolayı `EMAIL_PASS` olarak ayarla

---

## 🚀 Başlatma

### Geliştirme Modu (Otomatik Reload)
```bash
npm run dev
```
> Geliştirme modunda nodemon kullanılır. Dosya değişiklikleri otomatik olarak sunucuyu yeniden başlatır.

### Üretim Modu
```bash
npm start
```

### Sunucuyu Test Et
```bash
curl http://localhost:3000/api/health
```

### Canlı yayın (Render)

Bu projede bulunan `render.yaml`, başvuru ve panel verilerini kalıcı diskte tutacak şekilde hazırlanmıştır. Render hesabında GitHub deposunu bağlayın; hizmet yapılandırması otomatik okunur. Ardından yalnızca `EMAIL_USER` ve Google App Password olan `EMAIL_PASS` değerlerini Render'ın **Environment** bölümünden girin. Alan adınızı bu servise yönlendirin.

> Önemli: Sadece GitHub Pages gibi statik barındırma çözümleri, panel verilerini cihazlar arasında eşitleyemez ve otomatik e-posta gönderemez. Bu nedenle site Node.js çalıştıran bir sunucuda yayımlanmalıdır.

**Başarılı Yanıt:**
```json
{
  "status": "ok",
  "message": "Backend çalışıyor",
  "timestamp": "2026-09-01T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## 📡 API Endpoints

### Health Check
```http
GET /api/health
```
Sunucu sağlık durumunu kontrol et.

**Yanıt (200):**
```json
{
  "status": "ok",
  "message": "Backend çalışıyor",
  "timestamp": "2026-09-01T10:30:00.000Z",
  "version": "1.0.0"
}
```

### E-Posta Gönder
```http
POST /api/send-email
```

**Request Body:**
```json
{
  "to": "participant@example.com",
  "type": "approve",
  "data": {
    "commission": "Ekonomi Komisyonu",
    "fee": 650,
    "dekontEmail": "payment@example.com",
    "paymentName": "Organizatör Adı",
    "iban": "TR12 XXXX XXXX XXXX XXXX XXXX XX",
    "name": "Katılımcı Adı"
  }
}
```

**Geçerli `type` Değerleri:**
- `approve` - Başvuru onay e-postası
- `reject` - Başvuru ret e-postası

**Yanıt (200):**
```json
{
  "success": true,
  "message": "E-posta başarıyla gönderildi"
}
```

**Hata Yanıtları:**
```json
{
  "success": false,
  "error": "Geçersiz e-posta adresi"
}
```

**HTTP Status Kodları:**
- `200` - Başarılı
- `400` - Hatalı İstek (Eksik parametreler, geçersiz e-posta vb.)
- `500` - Sunucu Hatası

---

## 📁 Proje Yapısı

```
vizyon-ulusal-forum/
├── index.html              # Ana sayfa
├── basvuru.html            # Başvuru formu sayfası
├── ekibimiz.html           # Ekip sayfası
├── admin-login.html        # Admin giriş
├── admin-panel.html        # Admin paneli
├── ik-login.html           # IK giriş
├── ik-panel.html           # IK paneli
├── style.css               # Global stiller
├── basvuru.css             # Başvuru sayfası stilleri
├── server.js               # Backend sunucusu (Express)
├── data-sync.js            # Cihazlar arası veri eşitleme katmanı
├── render.yaml             # Canlı yayın yapılandırması
├── package.json            # Proje metaveri ve bağımlılıklar
├── .env.example            # Ortam değişkenleri şablonu
├── .env                    # Ortam değişkenleri (gitignore'da)
├── .gitignore              # Git ignore dosyası
├── README.md               # Bu dosya
└── vizyonulusalforum.png   # Logo
```

---

## 🔐 Güvenlik

### Best Practices
- ✅ Gizli bilgiler `.env` dosyasında saklanır
- ✅ `.env` dosyası `.gitignore`'da yer alır
- ✅ E-mail validasyonu sunucu tarafında yapılır
- ✅ CORS güvenliği yapılandırılmıştır
- ✅ İstek boyut limiti tanımlanmıştır (1MB)
- ✅ Hata detayları güvenli şekilde sunulur

### Önemli Notlar
- Hiçbir zaman özel bilgileri (API keys, şifreler) koda gömmeyin
- Üretim ortamında `ALLOWED_ORIGINS` değerini sınırlandırın
- Düzenli olarak bağımlılıkları güncelleyin: `npm audit`

---

## 🐛 Sorun Giderme

### Sorun: "Eksik ortam değişkenleri" hatası
**Çözüm:** `.env` dosyasının mevcut olduğundan ve gerekli değişkenleri içerdiğinden emin olun.

### Sorun: E-postalar gönderilenmiyor
**Çözüm:**
1. `EMAIL_USER` ve `EMAIL_PASS` değerlerini doğrulayın
2. Google Account'ta App Password etkin mi kontrol edin
3. Sunucu loglarında hata mesajını kontrol edin

### Sorun: Port zaten kullanımda
**Çözüm:** Farklı port kullan:
```bash
PORT=3001 npm start
```

---

## 📝 Değişiklik Logı

### v1.0.0 (2026-09-01)
- ✅ İlk sürüm yayınlandı
- ✅ Başvuru sistemi tamamlandı
- ✅ Backend API'si geliştirildi
- ✅ E-posta bildirimleri entegre edildi
- ✅ Admin ve IK panelleri eklendi

---

## 🤝 Katkı Yapma

Proje geliştirmesine katkı sağlamak isterseniz:

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişiklikleri commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📞 İletişim

**Genel Koordinatör:**
- Yiğit Efe SEVİR: [0546 926 2010](tel:+905469262010)

**Genel Koordinatör:**
- Ada Nehir ŞAHİN: [0501 012 58 60](tel:+905010125860)

**Email:** vizyonulusalforumik@gmail.com

---

## 📄 Lisans

Bu proje özel kullanım için tasarlanmıştır. Telif hakları saklıdır.

---

## ⭐ Desteğiniz

Eğer bu projeyi beğendiyseniz, ⭐ vermeyi unutmayın!

---

**Yapımcılar:** Vizyon Ulusal Forum Organizasyon Ekibi

**Son Güncelleme:** 2026-09-01
