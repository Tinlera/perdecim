/**
 * Admin kullanıcısını güncelleme scripti
 * 
 * Kullanım:
 * node src/scripts/updateAdmin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Setting } = require('../models');

const ADMIN_EMAIL = 'fatih@uygunlarevtekstil.com';
const ADMIN_PASSWORD = '123456789Fu!';
const ADMIN_FIRST_NAME = 'Fatih Can';
const ADMIN_LAST_NAME = 'Uygun';

async function updateAdmin() {
  try {
    console.log('Veritabanına bağlanılıyor...');
    await sequelize.authenticate();
    console.log('Bağlantı başarılı!');

    // Tabloları senkronize et
    await sequelize.sync({ alter: true });
    console.log('Tablolar senkronize edildi.');

    // Mevcut admin kullanıcısını bul veya oluştur
    let admin = await User.findOne({ where: { role: 'admin' } });

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    if (admin) {
      // Admin mevcutsa güncelle
      await admin.update({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        firstName: ADMIN_FIRST_NAME,
        lastName: ADMIN_LAST_NAME,
        canChangePassword: false, // Admin web üzerinden şifre değiştiremez
        isActive: true
      });
      console.log('✅ Admin kullanıcısı güncellendi:');
    } else {
      // Admin yoksa oluştur
      admin = await User.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        firstName: ADMIN_FIRST_NAME,
        lastName: ADMIN_LAST_NAME,
        role: 'admin',
        canChangePassword: false,
        isActive: true
      });
      console.log('✅ Admin kullanıcısı oluşturuldu:');
    }

    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Şifre: ${ADMIN_PASSWORD}`);
    console.log(`   Ad Soyad: ${ADMIN_FIRST_NAME} ${ADMIN_LAST_NAME}`);

    // Varsayılan ayarları oluştur
    const defaultSettings = [
      // Email ayarları
      { key: 'smtp_host', value: '', type: 'text', group: 'email' },
      { key: 'smtp_port', value: '587', type: 'number', group: 'email' },
      { key: 'smtp_secure', value: 'false', type: 'boolean', group: 'email' },
      { key: 'smtp_user', value: '', type: 'text', group: 'email' },
      { key: 'smtp_pass', value: '', type: 'text', group: 'email' },
      { key: 'from_email', value: '', type: 'text', group: 'email' },
      { key: 'from_name', value: 'Uygunlar Ev Tekstil', type: 'text', group: 'email' },
      { key: 'email_welcome_enabled', value: 'true', type: 'boolean', group: 'email' },
      { key: 'email_new_user_notify', value: 'true', type: 'boolean', group: 'email' },
      { key: 'email_order_notify', value: 'true', type: 'boolean', group: 'email' },
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

    for (const setting of defaultSettings) {
      await Setting.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });
    }

    console.log('✅ Varsayılan ayarlar oluşturuldu.');
    
    console.log('\n🎉 İşlem tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

updateAdmin();

