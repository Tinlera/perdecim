/**
 * Admin kullanıcısını başlatma/güncelleme fonksiyonu
 * Uygulama her başladığında çalışır
 */

const bcrypt = require('bcryptjs');
const { User, Setting } = require('../models');

const ADMIN_EMAIL = 'fatih@uygunlarevtekstil.com';
const ADMIN_PASSWORD = '123456789Fu!';
const ADMIN_FIRST_NAME = 'Fatih Can';
const ADMIN_LAST_NAME = 'Uygun';

async function initializeAdmin() {
  try {
    console.log('[Init] Admin kullanıcısı kontrol ediliyor...');

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    // Önce email ile kontrol et
    let admin = await User.findOne({ where: { email: ADMIN_EMAIL } });
    
    if (admin) {
      // Email eşleşiyor - admin'i güncelle (şifre dahil)
      await admin.update({
        password: hashedPassword,
        firstName: ADMIN_FIRST_NAME,
        lastName: ADMIN_LAST_NAME,
        role: 'admin',
        canChangePassword: false,
        isActive: true
      });
      console.log('[Init] ✅ Admin şifresi ve bilgileri güncellendi:', ADMIN_EMAIL);
    } else {
      // Email ile bulunamadı, role ile kontrol et
      admin = await User.findOne({ where: { role: 'admin' } });
      
      if (admin) {
        // Eski admin var, emailini ve şifresini güncelle
        await admin.update({
          email: ADMIN_EMAIL,
          password: hashedPassword,
          firstName: ADMIN_FIRST_NAME,
          lastName: ADMIN_LAST_NAME,
          canChangePassword: false,
          isActive: true
        });
        console.log('[Init] ✅ Admin kullanıcısı güncellendi (eski email):', ADMIN_EMAIL);
      } else {
        // Admin hiç yok, oluştur
        admin = await User.create({
          email: ADMIN_EMAIL,
          password: hashedPassword,
          firstName: ADMIN_FIRST_NAME,
          lastName: ADMIN_LAST_NAME,
          role: 'admin',
          canChangePassword: false,
          isActive: true
        });
        console.log('[Init] ✅ Admin kullanıcısı oluşturuldu:', ADMIN_EMAIL);
      }
    }

    // Varsayılan ayarları oluştur
    await initializeSettings();

    return admin;
  } catch (error) {
    console.error('[Init] ❌ Admin başlatma hatası:', error.message);
    console.error('[Init] Stack:', error.stack);
    // Kritik hata değil, devam et
  }
}

async function initializeSettings() {
  const defaultSettings = [
    // Email ayarları
    { key: 'smtp_host', value: '', type: 'text', group: 'email' },
    { key: 'smtp_port', value: '587', type: 'number', group: 'email' },
    { key: 'smtp_secure', value: 'false', type: 'boolean', group: 'email' },
    { key: 'smtp_user', value: '', type: 'text', group: 'email' },
    { key: 'smtp_pass', value: '', type: 'text', group: 'email' },
    { key: 'from_email', value: '', type: 'text', group: 'email' },
    { key: 'from_name', value: 'Uygunlar Ev Tekstil', type: 'text', group: 'email' },
    { key: 'email_welcome_enabled', value: 'false', type: 'boolean', group: 'email' },
    { key: 'email_new_user_notify', value: 'false', type: 'boolean', group: 'email' },
    { key: 'email_order_notify', value: 'false', type: 'boolean', group: 'email' },
    { key: 'admin_notification_email', value: ADMIN_EMAIL, type: 'text', group: 'email' },
    
    // WhatsApp ayarları
    { key: 'whatsapp_enabled', value: 'true', type: 'boolean', group: 'whatsapp' },
    { key: 'whatsapp_phone', value: '905551234567', type: 'text', group: 'whatsapp' },
    { key: 'whatsapp_business_api_enabled', value: 'false', type: 'boolean', group: 'whatsapp' },
    { key: 'whatsapp_api_token', value: '', type: 'text', group: 'whatsapp' },
    { key: 'whatsapp_phone_id', value: '', type: 'text', group: 'whatsapp' },
    { key: 'whatsapp_business_id', value: '', type: 'text', group: 'whatsapp' },
    
    // Google OAuth ayarları
    { key: 'google_oauth_enabled', value: 'false', type: 'boolean', group: 'auth' },
    { key: 'google_client_id', value: '', type: 'text', group: 'auth' },
    
    // Genel ayarlar
    { key: 'site_name', value: 'Uygunlar Ev Tekstil', type: 'text', group: 'general' },
    { key: 'site_description', value: 'Premium Perde & Ev Tekstili', type: 'text', group: 'general' },
    { key: 'site_phone', value: '+90 555 123 45 67', type: 'text', group: 'general' },
    { key: 'site_email', value: 'info@uygunlarevtekstil.com', type: 'text', group: 'general' },
    { key: 'site_address', value: 'Bağdat Caddesi No:123, Kadıköy/İstanbul', type: 'text', group: 'general' },
    
    // Onay sistemi ayarları
    { key: 'require_price_approval', value: 'true', type: 'boolean', group: 'approval' },
    { key: 'require_visibility_approval', value: 'true', type: 'boolean', group: 'approval' },
  ];

  let created = 0;
  for (const setting of defaultSettings) {
    const [record, wasCreated] = await Setting.findOrCreate({
      where: { key: setting.key },
      defaults: setting
    });
    if (wasCreated) created++;
  }

  if (created > 0) {
    console.log(`[Init] ✅ ${created} yeni ayar oluşturuldu`);
  }
}

module.exports = { initializeAdmin };

