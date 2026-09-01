require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Validate environment variables at startup
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ HATA: Gerekli ortam değişkenleri eksik:', missingEnvVars.join(', '));
  console.error('Lütfen .env dosyasını düzenleyin ve şu değişkenleri ayarlayın:', missingEnvVars.join(', '));
  process.exit(1);
}

// Utility function for email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  maxAge: 600
}));
app.use(express.json({ limit: '1mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// E-posta transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// E-posta şablonları
const emailTemplates = {
  approve: (data) => ({
    subject: 'Vizyon Ulusal Forum 2026 - Başvurunuz Onaylandı! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0B1F3A, #1e4080); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Vizyon Ulusal Forum 2026</h1>
          <p style="color: #60a5fa; margin: 10px 0 0;">Başvurunuz Onaylandı!</p>
        </div>
        <div style="background: #fff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <p style="color: #333; line-height: 1.6;">Sayın Katılımcımız,</p>
          <p style="color: #333; line-height: 1.6;">Vizyon Ulusal Forum 2026 için gerçekleştirdiğiniz başvuru değerlendirilmiş olup, <strong>${data.commission}</strong> Komisyonuna kabul edildiğinizi memnuniyetle bildiririz! 🎉</p>
          
          <p style="color: #333; line-height: 1.6;">Katılım sürecinizin kesinleşmesi için <strong>${data.fee} TL</strong> olan kayıt ücretinin 3 gün içerisinde aşağıdaki hesaba gönderilmesi gerekmektedir.</p>
          <p style="color: #333; line-height: 1.6;">Ödeme sonrası dekontunuzu "<strong>Ad Soyad - Komisyon ismi</strong>" açıklamasıyla birlikte alt kısımda belirttiğimiz mail adresine iletmenizi rica ederiz.</p>
          
          <div style="background: #F0F3F9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0B1F3A; margin: 0 0 15px;">📨 Dekont gönderim adresi:</h3>
            <p style="color: #333; margin: 5px 0; font-weight: bold;">${data.dekontEmail}</p>
            
            <h3 style="color: #0B1F3A; margin: 20px 0 15px;">💳 Ödeme Bilgileri</h3>
            <p style="color: #333; margin: 5px 0;"><strong>Ad Soyad:</strong> ${data.paymentName}</p>
            <p style="color: #333; margin: 5px 0;"><strong>IBAN:</strong> ${data.iban}</p>
            <p style="color: #333; margin: 5px 0;"><strong>Tutar:</strong> ${data.fee} TL</p>
            <p style="color: #666; margin: 10px 0 5px; font-size: 12px;">Not: Açıklama kısmını boş bırakınız.</p>
          </div>
          
          <p style="color: #333; line-height: 1.6;">Mail konu kısmına "<strong>Ad Soyad - Komisyon ismi</strong>" yazmayı unutmayınız.</p>
          
          <p style="color: #333; line-height: 1.6;">Dekontunuz ulaştığında etkinliğe resmî olarak dahil edilecek ve süreçle ilgili tüm bilgiler tarafınıza iletilecektir.</p>
          
          <p style="color: #333; line-height: 1.6; font-weight: bold;">İÜ X Vizyon Ulusal Forum ailesine hoş geldiniz!</p>
          
          <p style="color: #333; line-height: 1.6;">Saygılarımızla,<br>Vizyon Ulusal Forum İnsan Kaynakları Birimi</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://vizyonulusalforum.com" style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Web Sitemizi Ziyaret Edin</a>
          </div>
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">Bu e-posta otomatik olarak gönderilmiştir.</p>
        </div>
      </div>
    `
  }),
  
  reject: (data) => ({
    subject: 'Vizyon Ulusal Forum 2026 - Başvurunuz Hakkında',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626, #991b1b); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Vizyon Ulusal Forum 2026</h1>
          <p style="color: #fecaca; margin: 10px 0 0;">Başvuru Sonucu</p>
        </div>
        <div style="background: #fff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <p style="color: #333; line-height: 1.6;">Sayın <strong>${data.name}</strong>,</p>
          <p style="color: #333; line-height: 1.6;">Vizyon Ulusal Forum 2026 başvurunuz değerlendirilmiştir. Maalesef başvurunuz bu sefer onaylanmamıştır.</p>
          
          <p style="color: #333; line-height: 1.6;">Başvurunuzun detaylı değerlendirilmesi yapılmış olup, gelecekteki etkinliklerimiz için tekrar başvuruda bulunabilirsiniz.</p>
          
          <p style="color: #333; line-height: 1.6;">Herhangi bir sorunuz için bize ulaşabilirsiniz:</p>
          <ul style="color: #333; line-height: 1.8;">
            <li>Yiğit Efe SEVİR: 0546 926 2010</li>
            <li>Ada Nehir ŞAHİN: 0501 012 58 60</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://vizyonulusalforum.com" style="background: linear-gradient(135deg, #6B7A99, #5A6A8A); color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Web Sitemizi Ziyaret Edin</a>
          </div>
          
          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">Bu e-posta otomatik olarak gönderilmiştir.</p>
        </div>
      </div>
    `
  })
};

// E-posta gönderme endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, type, data } = req.body;
    
    // Validate input parameters
    if (!to || !type || !data) {
      return res.status(400).json({ success: false, error: 'Eksik parametreler' });
    }
    
    // Validate email format
    if (!validateEmail(to)) {
      return res.status(400).json({ success: false, error: 'Geçersiz e-posta adresi' });
    }
    
    // Validate email type
    const template = emailTemplates[type];
    if (!template) {
      return res.status(400).json({ success: false, error: 'Geçersiz e-posta türü' });
    }
    
    // Validate and sanitize data object
    if (typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ success: false, error: 'Geçersiz veri formatı' });
    }
    
    const emailContent = template(data);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
      replyTo: process.env.EMAIL_USER
    };
    
    await transporter.sendMail(mailOptions);
    
    console.log(`✓ E-posta gönderildi: ${to} (Tür: ${type})`);
    res.json({ success: true, message: 'E-posta başarıyla gönderildi' });
  } catch (error) {
    console.error('❌ E-posta gönderme hatası:', error.message);
    res.status(500).json({ success: false, error: 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend çalışıyor',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint bulunamadı' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Sunucu Hatası:', err);
  res.status(500).json({ 
    success: false, 
    error: 'İç sunucu hatası. Lütfen daha sonra tekrar deneyin.' 
  });
});

const server = app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🚀 Vizyon Ulusal Forum Backend Başlatıldı');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`⏰ Saat: ${new Date().toLocaleString('tr-TR')}`);
  console.log('═══════════════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM alındı. Sunucu kapanıyor...');
  server.close(() => {
    console.log('✓ Sunucu başarıyla kapatıldı');
    process.exit(0);
  });
});
