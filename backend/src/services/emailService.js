const nodemailer = require('nodemailer');
const { Setting } = require('../models');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
  }

  async initialize() {
    try {
      // Get email settings from database
      const settings = await Setting.findAll({
        where: { group: 'email' }
      });

      const emailSettings = {};
      settings.forEach(s => {
        emailSettings[s.key] = s.value;
      });

      if (!emailSettings.smtp_host || !emailSettings.smtp_user || !emailSettings.smtp_pass) {
        console.log('[EmailService] Email yapılandırması eksik');
        this.isConfigured = false;
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: emailSettings.smtp_host,
        port: parseInt(emailSettings.smtp_port) || 587,
        secure: emailSettings.smtp_secure === 'true',
        auth: {
          user: emailSettings.smtp_user,
          pass: emailSettings.smtp_pass
        }
      });

      this.fromEmail = emailSettings.from_email || emailSettings.smtp_user;
      this.fromName = emailSettings.from_name || 'Uygunlar Ev Tekstil';
      this.isConfigured = true;

      console.log('[EmailService] Email servisi başarıyla yapılandırıldı');
    } catch (error) {
      console.error('[EmailService] Yapılandırma hatası:', error.message);
      this.isConfigured = false;
    }
  }

  async sendEmail({ to, subject, html, text }) {
    if (!this.isConfigured) {
      await this.initialize();
    }

    if (!this.isConfigured) {
      console.log(`[EmailService] Email gönderilemedi (yapılandırılmamış): ${to} - ${subject}`);
      return { success: false, message: 'Email servisi yapılandırılmamış' };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text
      });

      console.log(`[EmailService] Email gönderildi: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[EmailService] Email gönderme hatası:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Hoşgeldiniz emaili
  async sendWelcomeEmail(user) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4AF37, #B8860B); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #D4AF37; color: #1a1a1a; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Uygunlar Ev Tekstil'e Hoşgeldiniz!</h1>
          </div>
          <div class="content">
            <p>Merhaba ${user.firstName},</p>
            <p>Uygunlar Ev Tekstil ailesine katıldığınız için teşekkür ederiz!</p>
            <p>Hesabınızla şunları yapabilirsiniz:</p>
            <ul>
              <li>Premium perde koleksiyonumuzu keşfedin</li>
              <li>Siparişlerinizi takip edin</li>
              <li>Özel indirimlerden yararlanın</li>
              <li>Ücretsiz ölçü hizmetimizden faydalanın</li>
            </ul>
            <center>
              <a href="${process.env.FRONTEND_URL}/products" class="button">Koleksiyonu Keşfet</a>
            </center>
            <p>Sorularınız için bize ulaşmaktan çekinmeyin.</p>
            <p>Saygılarımızla,<br>Uygunlar Ev Tekstil Ekibi</p>
          </div>
          <div class="footer">
            <p>Bu email ${user.email} adresine gönderilmiştir.</p>
            <p>© ${new Date().getFullYear()} Uygunlar Ev Tekstil. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: user.email,
      subject: 'Uygunlar Ev Tekstil\'e Hoşgeldiniz! 🎉',
      html
    });
  }

  // Yeni üye kaydı admin bildirimi
  async sendNewUserNotification(user, adminEmail) {
    const html = `
      <h2>Yeni Üye Kaydı</h2>
      <p>Yeni bir kullanıcı sisteme kayıt oldu:</p>
      <ul>
        <li><strong>Ad Soyad:</strong> ${user.firstName} ${user.lastName}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Telefon:</strong> ${user.phone || 'Belirtilmedi'}</li>
        <li><strong>Kayıt Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}</li>
      </ul>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `[Yeni Üye] ${user.firstName} ${user.lastName}`,
      html
    });
  }

  // WhatsApp mesaj bildirimi
  async sendWhatsAppMessageNotification(messageData, adminEmail) {
    const html = `
      <h2>Yeni WhatsApp Mesajı</h2>
      <p>Canlı destekten yeni bir mesaj alındı:</p>
      <ul>
        <li><strong>Gönderen:</strong> ${messageData.name || 'Bilinmiyor'}</li>
        <li><strong>Telefon:</strong> ${messageData.phone}</li>
        <li><strong>Mesaj:</strong> ${messageData.message}</li>
        <li><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</li>
      </ul>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `[WhatsApp] Yeni Mesaj - ${messageData.phone}`,
      html
    });
  }

  // Sipariş bildirimi
  async sendOrderNotification(order, adminEmail) {
    const html = `
      <h2>Yeni Sipariş</h2>
      <p>Yeni bir sipariş alındı:</p>
      <ul>
        <li><strong>Sipariş No:</strong> ${order.orderNumber}</li>
        <li><strong>Müşteri:</strong> ${order.user?.firstName} ${order.user?.lastName}</li>
        <li><strong>Toplam:</strong> ₺${order.total}</li>
        <li><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</li>
      </ul>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `[Yeni Sipariş] #${order.orderNumber}`,
      html
    });
  }

  // Onay bekleyen işlem bildirimi
  async sendApprovalRequestNotification(approval, adminEmail) {
    const typeLabels = {
      price_change: 'Fiyat Değişikliği',
      product_update: 'Ürün Güncelleme',
      product_visibility: 'Ürün Görünürlük',
      stock_change: 'Stok Değişikliği'
    };

    const html = `
      <h2>Onay Bekleyen İşlem</h2>
      <p>Yeni bir onay talebi oluşturuldu:</p>
      <ul>
        <li><strong>İşlem Türü:</strong> ${typeLabels[approval.type] || approval.type}</li>
        <li><strong>Talep Eden:</strong> ${approval.requester?.firstName} ${approval.requester?.lastName}</li>
        <li><strong>Eski Değer:</strong> ${JSON.stringify(approval.oldValue)}</li>
        <li><strong>Yeni Değer:</strong> ${JSON.stringify(approval.newValue)}</li>
        <li><strong>Tarih:</strong> ${new Date().toLocaleString('tr-TR')}</li>
      </ul>
      <p><a href="${process.env.FRONTEND_URL}/admin/approvals">Onay paneline git</a></p>
    `;

    return this.sendEmail({
      to: adminEmail,
      subject: `[Onay Bekliyor] ${typeLabels[approval.type] || approval.type}`,
      html
    });
  }
}

module.exports = new EmailService();

