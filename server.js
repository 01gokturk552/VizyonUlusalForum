require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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
    
    if (!to || !type || !data) {
      return res.status(400).json({ success: false, error: 'Eksik parametreler' });
    }
    
    const template = emailTemplates[type];
    if (!template) {
      return res.status(400).json({ success: false, error: 'Geçersiz e-posta türü' });
    }
    
    const emailContent = template(data);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };
    
    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'E-posta başarıyla gönderildi' });
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    res.status(500).json({ success: false, error: 'E-posta gönderilemedi' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend çalışıyor' });
});

app.listen(PORT, () => {
  console.log(`Backend sunucusu ${PORT} portunda çalışıyor`);
});
