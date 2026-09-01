# Vizyon Ulusal Forum'a Katkı Rehberi

Öncelikle Vizyon Ulusal Forum projesine katkı sağlamak için vakit ayırdığınız için teşekkür ederiz! 🎉

Bu rehber, katkı sürecini net bir şekilde anlatan bir kılavuzdur.

---

## 📋 Davranış Kuralları

### Biz İnanıyoruz
- Saygılı ve kapsayıcı bir ortam oluşturmaya
- Herkesin görüşüne değer vermeye
- Yapıcı geri bildirimi açık şekilde sunmaya
- Takım ruhu ile çalışmaya

---

## 🚀 Başlamadan Önce

1. Proje README'sini oku
2. Mevcut Issues ve Pull Requests'i kontrol et
3. Projeyi lokal makinena klonla
4. Bağımlılıkları yükle: `npm install`

---

## 🔄 Katkı Süreci

### 1. Issue Oluştur veya Seç
- Bug bulduğun zaman: Yeni issue aç
- Feature eklemek istersen: Feature request oluştur
- Var olan issue üzerinde çalışmak istersen: Yorum olarak belirt

**Issue Formatı:**
```
Başlık: [BUG/FEATURE/IMPROVEMENT] Kısa Açıklama

Açıklama:
Detaylı açıklama...

Adımlar (BUG ise):
1. Adım 1
2. Adım 2

Beklenen Davranış:
Neler olması gerekiyordu?

Gerçek Davranış:
Neler oldu?

Ortam:
- OS: Windows 10
- Node: 16.x
- npm: 8.x
```

### 2. Fork ve Branch Oluştur
```bash
# Repository'yi fork et
git clone https://github.com/YOUR_USERNAME/vizyon-ulusal-forum.git
cd vizyon-ulusal-forum

# Ana branch'i güncelle
git checkout main
git pull origin main

# Feature branch oluştur
git checkout -b feature/your-feature-name
# veya bug fix için:
git checkout -b fix/bug-name
```

### 3. Değişiklikleri Yap
```bash
# Dosyaları düzenle
# Düzenli commit yap
git add .
git commit -m "Description of changes"
```

### 4. Kod Kalitesi Kontrol Et
```bash
# Syntax hatası var mı kontrol et
npm run lint  # (eğer konfigüre edildiyse)

# Sunucuyu test et
npm start

# Browser'da test et
# http://localhost:3000
```

### 5. Commit Mesajları
Açık ve tanımlayıcı commit mesajları yaz:

```
✅ GOOD:
- "Add email validation to contact form"
- "Fix typo in documentation"
- "Refactor API error handling"

❌ BAD:
- "update"
- "fix stuff"
- "wip"
```

**Commit Türleri:**
- `feat:` Yeni özellik
- `fix:` Bug fix
- `docs:` Dokümantasyon
- `style:` Kod stili (boşluk, formatting vb.)
- `refactor:` Kod yeniden yapılandırma
- `test:` Test ekleme/düzenleme
- `chore:` Diğer değişiklikler

---

## 🔍 Pull Request Süreci

### 1. Push et ve PR Oluştur
```bash
git push origin feature/your-feature-name
```

### 2. PR Şablonu Doldur
```markdown
## Açıklama
Bu PR'nin amacı nedir?

## Tür
- [ ] Bug Fix
- [ ] Yeni Özellik
- [ ] Dokümantasyon
- [ ] Refactoring

## Değişiklikler
- Değişiklik 1
- Değişiklik 2

## Testing
Nasıl test ettiniz?

## Checklist
- [ ] Kodum kendi başına test geçer
- [ ] README güncelledim (ise)
- [ ] .env.example güncelledim (ise)
- [ ] Yeni bağımlılık ekledim (ise): package.json'ı güncelledim
```

### 3. İnceleme Sürecini Bekle
- Kod incelemesi yapılacak
- Değişiklik talepleri gelebilir
- Yapıcı geribildirim sunulacak

### 4. Requested Changes'i Yap
```bash
# Değişiklikleri yap
git add .
git commit -m "Address review comments"
git push origin feature/your-feature-name
```

---

## 📝 Stil Rehberi

### JavaScript
```javascript
// ✅ Const/let kullan, var kullanma
const name = "Vizyon";
let count = 0;

// ✅ Arrow function tercih et
const add = (a, b) => a + b;

// ✅ Template literals kullan
const message = `Hello, ${name}`;

// ✅ Açık fonksiyon adları
const validateEmail = (email) => { /* ... */ };
```

### HTML/CSS
```html
<!-- ✅ Semantic HTML -->
<button class="btn-primary">Gönder</button>

<!-- ✅ Class adlarında BEM konvansiyonu -->
<div class="form-container">
  <div class="form-container__header">Header</div>
  <div class="form-container__body">Body</div>
</div>
```

### Türkçe/English
- Kod yorumları İngilizce yaz
- Commit mesajları İngilizce yaz
- Dokümantasyon Türkçe yaz

---

## 🧪 Test Etme

Kod değişikliklerinizi aşağıdaki şekillerde test edin:

### Manuel Test
```bash
npm start
# Tarayıcıda http://localhost:3000 aç
# Değişiklikleri test et
```

### API Test (Postman/cURL)
```bash
# Health check
curl http://localhost:3000/api/health

# E-posta gönder
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "type": "approve",
    "data": { /* ... */ }
  }'
```

---

## ❌ Gözden Kaçırılan Hatalar

Aşağıdaki hataları yapmaktan kaçın:

❌ `.env` dosyasını commit etme (`.gitignore`'da zaten)
❌ Komut satırından gizli bilgiler loggala
❌ Kodu formatlamadan push etme
❌ PR açmadan önce test etme
❌ Issue/PR adını belirsiz bırakma

---

## 🎓 Faydalı Kaynaklar

- [Node.js Dokümantasyonu](https://nodejs.org/docs/)
- [Express.js Rehberi](https://expressjs.com/)
- [Nodemailer](https://nodemailer.com/)
- [Git Rehberi](https://git-scm.com/docs)

---

## 📞 Sorularınız Var mı?

1. Issues bölümünde sor
2. Discussions'ı kullan
3. Koordinatörlere ulaş:
   - Yiğit Efe SEVİR: 0546 926 2010
   - Ada Nehir ŞAHİN: 0501 012 58 60

---

## 🎉 Teşekkür

Katkılarınız için teşekkür ederiz! Sizin desteğiniz projemizi daha iyi hale getiriyor.

Happy coding! 🚀
