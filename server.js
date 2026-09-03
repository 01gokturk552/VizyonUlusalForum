require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Validate environment variables at startup
const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASS'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.warn('⚠️ E-posta ayarları eksik. Site çalışmaya devam edecek, e-posta gönderimi devre dışı kalacak:', missingEnvVars.join(', '));
}

// Utility function for email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  credentials: true,
  maxAge: 600
}));
app.use(express.json({ limit: '1mb' }));

const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'site-data.json');
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'data', 'uploads');
const AUTH_LOG_FILE = process.env.AUTH_LOG_FILE || path.join(__dirname, 'data', 'auth-log.json');
const DEVELOPER_PASSWORD = process.env.DEVELOPER_PASSWORD || '';
const DEVELOPER_SESSION_SECRET = process.env.DEVELOPER_SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const SYNC_KEYS = new Set([
  'vuf_komisyonlar', 'vuf_ekip', 'vuf_sponsorlar', 'vuf_program',
  'vuf_istatistikler', 'vuf_ayarlar', 'vuf_basvuru_ayarlar',
  'vuf_form_builder', 'vuf_delegeler', 'vuf_delegasyonlar',
  'vuf_content_version', 'vuf_team_roles_version'
]);

function readSiteData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch { return { updatedAt: 0, data: {} }; }
}
function writeSiteData(payload) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const temporary = `${DATA_FILE}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(payload, null, 2), 'utf8');
  fs.renameSync(temporary, DATA_FILE);
}

function readAuthLogs() {
  try { return JSON.parse(fs.readFileSync(AUTH_LOG_FILE, 'utf8')); }
  catch { return []; }
}
function writeAuthLogs(logs) {
  fs.mkdirSync(path.dirname(AUTH_LOG_FILE), { recursive: true });
  fs.writeFileSync(AUTH_LOG_FILE, JSON.stringify(logs.slice(0, 1000), null, 2), 'utf8');
}
function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket.remoteAddress || 'Bilinmiyor').split(',')[0].trim();
}
function addAuthLog(req, role, username, result = 'Başarılı') {
  const logs = readAuthLogs();
  logs.unshift({ id: crypto.randomUUID(), role, username: String(username || '—').slice(0, 80), result, ip: clientIp(req), userAgent: String(req.headers['user-agent'] || 'Bilinmiyor').slice(0, 240), at: new Date().toISOString() });
  writeAuthLogs(logs);
}
function readCookies(req) {
  return Object.fromEntries(String(req.headers.cookie || '').split(';').map(item => {
    const pivot = item.indexOf('=');
    return pivot < 0 ? [] : [item.slice(0, pivot).trim(), decodeURIComponent(item.slice(pivot + 1).trim())];
  }).filter(item => item.length));
}
function createDeveloperToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000, nonce: crypto.randomUUID() })).toString('base64url');
  const signature = crypto.createHmac('sha256', DEVELOPER_SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}
function hasDeveloperSession(req) {
  const token = readCookies(req).vuf_developer_session;
  if (!token || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  const expected = crypto.createHmac('sha256', DEVELOPER_SESSION_SECRET).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}
function requireDeveloper(req, res, next) {
  if (!hasDeveloperSession(req)) return res.status(401).json({ success: false, error: 'Yetkisiz erişim' });
  next();
}

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (_, __, done) => done(null, UPLOAD_DIR),
    filename: (_, file, done) => {
      const extension = ({'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif'})[file.mimetype] || '.jpg';
      done(null, `ekip-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, done) => done(null, ['image/jpeg','image/png','image/webp','image/gif'].includes(file.mimetype))
});

app.get('/api/site-data', (req, res) => res.json(readSiteData()));
app.put('/api/site-data', (req, res) => {
  const { key, value } = req.body || {};
  if (!SYNC_KEYS.has(key)) return res.status(400).json({ success: false, error: 'Geçersiz veri anahtarı' });
  const payload = readSiteData();
  payload.data[key] = value;
  payload.updatedAt = Date.now();
  writeSiteData(payload);
  res.json({ success: true, updatedAt: payload.updatedAt });
});

// Admin ve İK girişleri tarayıcıda doğrulandıktan sonra başarı kaydı bırakır.
app.post('/api/auth-logs', (req, res) => {
  const { role, username } = req.body || {};
  if (!['admin', 'ik'].includes(role)) return res.status(400).json({ success: false, error: 'Geçersiz rol' });
  addAuthLog(req, role, username);
  res.status(201).json({ success: true });
});

app.post('/api/developer/login', (req, res) => {
  const password = String((req.body || {}).password || '');
  if (!DEVELOPER_PASSWORD) return res.status(503).json({ success: false, error: 'Geliştirici erişimi henüz yapılandırılmadı.' });
  const expected = Buffer.from(DEVELOPER_PASSWORD);
  const submitted = Buffer.from(password);
  if (submitted.length !== expected.length || !crypto.timingSafeEqual(submitted, expected)) {
    addAuthLog(req, 'developer', 'Geliştirici', 'Başarısız');
    return res.status(401).json({ success: false, error: 'Şifre hatalı.' });
  }
  addAuthLog(req, 'developer', 'Geliştirici');
  res.setHeader('Set-Cookie', `vuf_developer_session=${createDeveloperToken()}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  res.json({ success: true });
});
app.post('/api/developer/logout', requireDeveloper, (req, res) => {
  res.setHeader('Set-Cookie', 'vuf_developer_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  res.json({ success: true });
});
app.get('/api/developer/session', (req, res) => res.json({ authenticated: hasDeveloperSession(req) }));
app.get('/api/developer/auth-logs', requireDeveloper, (req, res) => res.json({ success: true, logs: readAuthLogs().slice(0, 250) }));

function saveProfilePhoto(req, res) {
  if (!req.file) return res.status(400).json({ success: false, error: 'JPG, PNG, WEBP veya GIF biçiminde bir fotoğraf seçin.' });
  res.status(201).json({ success: true, url: `/uploads/${req.file.filename}` });
}
app.post('/api/uploads/profile-photo', imageUpload.single('photo'), saveProfilePhoto);
app.post('/api/uploads/team-photo', imageUpload.single('photo'), saveProfilePhoto);

app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', immutable: true }));

// Canlı sitede HTML, CSS ve görselleri aynı alan adından sunar.
app.use(express.static(__dirname, { index: 'index.html' }));

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

function escapeHtml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function customMessage(data, fallback) {
  return `<p style="color:#333;line-height:1.75;white-space:normal">${escapeHtml(data.customMessage || fallback).replace(/\n/g, '<br>')}</p>`;
}

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
          <p style="color: #333; line-height: 1.6;">Sayın <strong>${escapeHtml(data.name)}</strong>,</p>
          ${customMessage(data, `Vizyon Ulusal Forum 2026 için gerçekleştirdiğiniz başvuru değerlendirilmiş olup, ${data.commission || 'ilgili'} komisyonuna kabul edildiğinizi memnuniyetle bildiririz.`)}
          
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
          <p style="color: #333; line-height: 1.6;">Sayın <strong>${escapeHtml(data.name)}</strong>,</p>
          ${customMessage(data, 'Vizyon Ulusal Forum 2026 başvurunuz değerlendirilmiştir. Maalesef başvurunuz bu sefer onaylanmamıştır.')}
          
          <p style="color: #333; line-height: 1.6;">Başvurunuzun detaylı değerlendirilmesi yapılmış olup, gelecekteki etkinliklerimiz için tekrar başvuruda bulunabilirsiniz.</p>
          
          <p style="color: #333; line-height: 1.6;">Sorularınız için Vizyon Ulusal Forum iletişim kanallarından bizimle iletişime geçebilirsiniz.</p>
          
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
    
    if (missingEnvVars.length > 0) return res.status(503).json({ success: false, error: 'E-posta servisi henüz yapılandırılmadı.' });
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
