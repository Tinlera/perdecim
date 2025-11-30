import { useState, useEffect } from 'react'
import {
  Save,
  Loader2,
  Store,
  CreditCard,
  Mail,
  Palette,
  Bell,
  Shield,
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const settingGroups = [
  { key: 'general', label: 'Genel Ayarlar', icon: Store },
  { key: 'payment', label: 'Ödeme Ayarları', icon: CreditCard },
  { key: 'email', label: 'Email Ayarları', icon: Mail },
  { key: 'appearance', label: 'Görünüm', icon: Palette },
  { key: 'notifications', label: 'Bildirimler', icon: Bell },
  { key: 'security', label: 'Güvenlik', icon: Shield },
]

export default function AdminSettings() {
  const [activeGroup, setActiveGroup] = useState('general')
  const [settings, setSettings] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getSettings()
      setSettings(response.data.data || {})
    } catch (error) {
      toast.error('Ayarlar yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await adminAPI.updateSettings(settings)
      toast.success('Ayarlar kaydedildi')
    } catch (error) {
      toast.error('Ayarlar kaydedilemedi')
    } finally {
      setIsSaving(false)
    }
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="label">Site Adı</label>
        <input
          type="text"
          value={settings.siteName || ''}
          onChange={(e) => handleChange('siteName', e.target.value)}
          className="input"
          placeholder="Perdecim"
        />
      </div>
      <div>
        <label className="label">Site Açıklaması</label>
        <textarea
          value={settings.siteDescription || ''}
          onChange={(e) => handleChange('siteDescription', e.target.value)}
          className="input"
          rows={3}
          placeholder="Premium perde ve ev tekstili..."
        />
      </div>
      <div>
        <label className="label">İletişim Email</label>
        <input
          type="email"
          value={settings.contactEmail || ''}
          onChange={(e) => handleChange('contactEmail', e.target.value)}
          className="input"
          placeholder="info@perdecim.com"
        />
      </div>
      <div>
        <label className="label">İletişim Telefon</label>
        <input
          type="tel"
          value={settings.contactPhone || ''}
          onChange={(e) => handleChange('contactPhone', e.target.value)}
          className="input"
          placeholder="+90 555 123 4567"
        />
      </div>
      <div>
        <label className="label">Adres</label>
        <textarea
          value={settings.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          className="input"
          rows={2}
        />
      </div>
      <div>
        <label className="label">Ücretsiz Kargo Limiti (₺)</label>
        <input
          type="number"
          value={settings.freeShippingLimit || ''}
          onChange={(e) => handleChange('freeShippingLimit', e.target.value)}
          className="input"
          placeholder="500"
        />
      </div>
      <div>
        <label className="label">Kargo Ücreti (₺)</label>
        <input
          type="number"
          value={settings.shippingCost || ''}
          onChange={(e) => handleChange('shippingCost', e.target.value)}
          className="input"
          placeholder="29.90"
        />
      </div>
    </div>
  )

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          İyzico API anahtarları güvenlik nedeniyle environment değişkenlerinde saklanmalıdır.
          Backend tarafında .env dosyasını düzenleyin.
        </p>
      </div>
      <div>
        <label className="label">Ödeme Modu</label>
        <select
          value={settings.paymentMode || 'sandbox'}
          onChange={(e) => handleChange('paymentMode', e.target.value)}
          className="input"
        >
          <option value="sandbox">Test (Sandbox)</option>
          <option value="production">Canlı (Production)</option>
        </select>
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.enableCreditCard || false}
          onChange={(e) => handleChange('enableCreditCard', e.target.checked)}
          className="w-4 h-4"
        />
        <span>Kredi Kartı ile Ödeme</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.enableBankTransfer || false}
          onChange={(e) => handleChange('enableBankTransfer', e.target.checked)}
          className="w-4 h-4"
        />
        <span>Havale/EFT ile Ödeme</span>
      </label>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.enableCurtainAnimation !== false}
          onChange={(e) => handleChange('enableCurtainAnimation', e.target.checked)}
          className="w-4 h-4"
        />
        <span>Açılış Animasyonu (Perde Efekti)</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.enableProductZoom !== false}
          onChange={(e) => handleChange('enableProductZoom', e.target.checked)}
          className="w-4 h-4"
        />
        <span>Ürün Hover Zoom Efekti</span>
      </label>
      <div>
        <label className="label">Ana Renk</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={settings.primaryColor || '#D4AF37'}
            onChange={(e) => handleChange('primaryColor', e.target.value)}
            className="w-12 h-12 rounded cursor-pointer"
          />
          <input
            type="text"
            value={settings.primaryColor || '#D4AF37'}
            onChange={(e) => handleChange('primaryColor', e.target.value)}
            className="input flex-1"
            placeholder="#D4AF37"
          />
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.notifyNewOrder || false}
          onChange={(e) => handleChange('notifyNewOrder', e.target.checked)}
          className="w-4 h-4"
        />
        <span>Yeni Sipariş Bildirimi</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.notifyLowStock || false}
          onChange={(e) => handleChange('notifyLowStock', e.target.checked)}
          className="w-4 h-4"
        />
        <span>Düşük Stok Bildirimi</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.notifyNewUser || false}
          onChange={(e) => handleChange('notifyNewUser', e.target.checked)}
          className="w-4 h-4"
        />
        <span>Yeni Üye Bildirimi</span>
      </label>
      <div>
        <label className="label">Bildirim Email Adresi</label>
        <input
          type="email"
          value={settings.notificationEmail || ''}
          onChange={(e) => handleChange('notificationEmail', e.target.value)}
          className="input"
          placeholder="admin@perdecim.com"
        />
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.requireEmailVerification || false}
          onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
          className="w-4 h-4"
        />
        <span>Email Doğrulaması Zorunlu</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.enable2FA || false}
          onChange={(e) => handleChange('enable2FA', e.target.checked)}
          className="w-4 h-4"
        />
        <span>2FA (İki Faktörlü Doğrulama) Aktif</span>
      </label>
      <div>
        <label className="label">Oturum Süresi (Gün)</label>
        <input
          type="number"
          value={settings.sessionDuration || '7'}
          onChange={(e) => handleChange('sessionDuration', e.target.value)}
          className="input"
          min="1"
          max="30"
        />
      </div>
      <div>
        <label className="label">Maksimum Giriş Denemesi</label>
        <input
          type="number"
          value={settings.maxLoginAttempts || '5'}
          onChange={(e) => handleChange('maxLoginAttempts', e.target.value)}
          className="input"
          min="3"
          max="10"
        />
      </div>
    </div>
  )

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          SMTP ayarları güvenlik nedeniyle environment değişkenlerinde saklanmalıdır.
        </p>
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.sendOrderConfirmation || false}
          onChange={(e) => handleChange('sendOrderConfirmation', e.target.checked)}
          className="w-4 h-4"
        />
        <span>Sipariş Onay Emaili Gönder</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.sendShippingNotification || false}
          onChange={(e) => handleChange('sendShippingNotification', e.target.checked)}
          className="w-4 h-4"
        />
        <span>Kargo Bildirim Emaili Gönder</span>
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.sendWelcomeEmail || false}
          onChange={(e) => handleChange('sendWelcomeEmail', e.target.checked)}
          className="w-4 h-4"
        />
        <span>Hoş Geldin Emaili Gönder</span>
      </label>
    </div>
  )

  const renderSettings = () => {
    switch (activeGroup) {
      case 'general': return renderGeneralSettings()
      case 'payment': return renderPaymentSettings()
      case 'email': return renderEmailSettings()
      case 'appearance': return renderAppearanceSettings()
      case 'notifications': return renderNotificationSettings()
      case 'security': return renderSecuritySettings()
      default: return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal-700">Site Ayarları</h1>
        <button onClick={handleSave} disabled={isSaving} className="btn-primary">
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          Kaydet
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl p-2">
            {settingGroups.map(group => (
              <button
                key={group.key}
                onClick={() => setActiveGroup(group.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeGroup === group.key
                    ? 'bg-gold-50 text-gold-700'
                    : 'text-charcoal-500 hover:bg-charcoal-50'
                }`}
              >
                <group.icon className="w-5 h-5" />
                <span>{group.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-charcoal-700 mb-6">
              {settingGroups.find(g => g.key === activeGroup)?.label}
            </h2>
            {renderSettings()}
          </div>
        </div>
      </div>
    </div>
  )
}

