import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Mail, 
  MessageSquare, 
  Shield, 
  Bell, 
  Globe,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  Phone,
  Building,
  MapPin,
  ExternalLink
} from 'lucide-react'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'general', label: 'Genel', icon: Globe },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'auth', label: 'Kimlik Doğrulama', icon: Shield },
  { id: 'approval', label: 'Onay Sistemi', icon: Check },
  { id: 'notifications', label: 'Bildirimler', icon: Bell },
]

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getSettings()
      const settingsObj = {}
      response.data.data.forEach(s => {
        settingsObj[s.key] = s.value
      })
      setSettings(settingsObj)
    } catch (error) {
      toast.error('Ayarlar yüklenirken hata oluştu')
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
      await adminAPI.updateSettings({ settings })
      toast.success('Ayarlar kaydedildi')
    } catch (error) {
      toast.error('Kaydetme hatası')
    } finally {
      setIsSaving(false)
    }
  }

  const togglePasswordVisibility = (key) => {
    setShowPassword(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
          <p className="text-gray-500 mt-1">Sistem ayarlarını yapılandırın</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Kaydet
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-2xl border border-gray-100 p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6"
          >
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Genel Ayarlar</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Building className="w-4 h-4 inline mr-1" />
                      Site Adı
                    </label>
                    <input
                      type="text"
                      value={settings.site_name || ''}
                      onChange={(e) => handleChange('site_name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Uygunlar Ev Tekstil"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Telefon
                    </label>
                    <input
                      type="text"
                      value={settings.site_phone || ''}
                      onChange={(e) => handleChange('site_phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="+90 555 123 45 67"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={settings.site_email || ''}
                      onChange={(e) => handleChange('site_email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="info@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Adres
                    </label>
                    <input
                      type="text"
                      value={settings.site_address || ''}
                      onChange={(e) => handleChange('site_address', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="İstanbul, Türkiye"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Açıklaması
                  </label>
                  <textarea
                    value={settings.site_description || ''}
                    onChange={(e) => handleChange('site_description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                    placeholder="Site açıklaması..."
                  />
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Email Ayarları (SMTP)</h2>
                  <a
                    href="https://support.google.com/mail/answer/185833"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 text-sm flex items-center gap-1 hover:underline"
                  >
                    Gmail App Password Rehberi
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Gmail kullanıyorsanız, 2FA aktif olmalı ve "App Password" oluşturmalısınız.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Sunucu</label>
                    <input
                      type="text"
                      value={settings.smtp_host || ''}
                      onChange={(e) => handleChange('smtp_host', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                    <input
                      type="text"
                      value={settings.smtp_port || '587'}
                      onChange={(e) => handleChange('smtp_port', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="587"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Kullanıcı</label>
                    <input
                      type="text"
                      value={settings.smtp_user || ''}
                      onChange={(e) => handleChange('smtp_user', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="your@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Şifre</label>
                    <div className="relative">
                      <input
                        type={showPassword.smtp_pass ? 'text' : 'password'}
                        value={settings.smtp_pass || ''}
                        onChange={(e) => handleChange('smtp_pass', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-12"
                        placeholder="App Password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('smtp_pass')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword.smtp_pass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gönderici Email</label>
                    <input
                      type="email"
                      value={settings.from_email || ''}
                      onChange={(e) => handleChange('from_email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="noreply@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gönderici Adı</label>
                    <input
                      type="text"
                      value={settings.from_name || ''}
                      onChange={(e) => handleChange('from_name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Uygunlar Ev Tekstil"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Email Bildirimleri</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">Hoşgeldiniz Emaili</p>
                        <p className="text-sm text-gray-500">Yeni üyelere hoşgeldiniz emaili gönder</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.email_welcome_enabled === 'true'}
                        onChange={(e) => handleChange('email_welcome_enabled', e.target.checked ? 'true' : 'false')}
                        className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">Yeni Üye Bildirimi</p>
                        <p className="text-sm text-gray-500">Yeni üye kaydında admin'e bildir</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.email_new_user_notify === 'true'}
                        onChange={(e) => handleChange('email_new_user_notify', e.target.checked ? 'true' : 'false')}
                        className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                      <div>
                        <p className="font-medium text-gray-900">Sipariş Bildirimi</p>
                        <p className="text-sm text-gray-500">Yeni siparişlerde admin'e bildir</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.email_order_notify === 'true'}
                        onChange={(e) => handleChange('email_order_notify', e.target.checked ? 'true' : 'false')}
                        className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                      />
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bildirim Alacak Email
                      </label>
                      <input
                        type="email"
                        value={settings.admin_notification_email || ''}
                        onChange={(e) => handleChange('admin_notification_email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="admin@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp Settings */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Ayarları</h2>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  WhatsApp Business API entegrasyonu için <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">Meta Business Suite</a>'e kayıt olmanız gerekir.
                </div>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">WhatsApp Butonu</p>
                    <p className="text-sm text-gray-500">Sitede WhatsApp butonunu göster</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.whatsapp_enabled === 'true'}
                    onChange={(e) => handleChange('whatsapp_enabled', e.target.checked ? 'true' : 'false')}
                    className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                  />
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Telefon Numarası
                  </label>
                  <input
                    type="text"
                    value={settings.whatsapp_phone || ''}
                    onChange={(e) => handleChange('whatsapp_phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="905551234567 (başında 0 olmadan)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ülke kodu ile birlikte, başında 0 veya + olmadan yazın</p>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">WhatsApp Business API (Opsiyonel)</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    WhatsApp Business API kullanmak için aşağıdaki bilgileri doldurun. 
                    Bu sayede müşterilerinize otomatik mesajlar gönderebilir ve WhatsApp Business üzerinden yönetebilirsiniz.
                  </p>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer mb-4">
                    <div>
                      <p className="font-medium text-gray-900">Business API Kullan</p>
                      <p className="text-sm text-gray-500">WhatsApp Business API'yi aktif et</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.whatsapp_business_api_enabled === 'true'}
                      onChange={(e) => handleChange('whatsapp_business_api_enabled', e.target.checked ? 'true' : 'false')}
                      className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                    />
                  </label>

                  {settings.whatsapp_business_api_enabled === 'true' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">API Token</label>
                        <div className="relative">
                          <input
                            type={showPassword.whatsapp_api_token ? 'text' : 'password'}
                            value={settings.whatsapp_api_token || ''}
                            onChange={(e) => handleChange('whatsapp_api_token', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-12"
                            placeholder="Meta Business API Token"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('whatsapp_api_token')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword.whatsapp_api_token ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number ID</label>
                        <input
                          type="text"
                          value={settings.whatsapp_phone_id || ''}
                          onChange={(e) => handleChange('whatsapp_phone_id', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="Phone Number ID from Meta"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Account ID</label>
                        <input
                          type="text"
                          value={settings.whatsapp_business_id || ''}
                          onChange={(e) => handleChange('whatsapp_business_id', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder="WhatsApp Business Account ID"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Auth Settings */}
            {activeTab === 'auth' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Kimlik Doğrulama Ayarları</h2>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Google ile giriş için <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a>'dan OAuth 2.0 Client ID oluşturun.
                </div>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Google ile Giriş</p>
                    <p className="text-sm text-gray-500">Müşterilerin Google hesabıyla giriş yapmasına izin ver</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.google_oauth_enabled === 'true'}
                    onChange={(e) => handleChange('google_oauth_enabled', e.target.checked ? 'true' : 'false')}
                    className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                  />
                </label>

                {settings.google_oauth_enabled === 'true' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Client ID</label>
                    <input
                      type="text"
                      value={settings.google_client_id || ''}
                      onChange={(e) => handleChange('google_client_id', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="xxx.apps.googleusercontent.com"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Approval Settings */}
            {activeTab === 'approval' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Onay Sistemi Ayarları</h2>
                
                <p className="text-gray-500 mb-6">
                  Bu ayarlar, personel yetkisindeki kullanıcıların yapacağı değişikliklerin 
                  yönetici/müdür onayı gerektirip gerektirmeyeceğini belirler.
                </p>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Fiyat Değişikliği Onayı</p>
                    <p className="text-sm text-gray-500">Personel fiyat değiştirdiğinde onay iste</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.require_price_approval === 'true'}
                    onChange={(e) => handleChange('require_price_approval', e.target.checked ? 'true' : 'false')}
                    className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900">Görünürlük Değişikliği Onayı</p>
                    <p className="text-sm text-gray-500">Personel ürünü satıştan kaldırdığında onay iste</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.require_visibility_approval === 'true'}
                    onChange={(e) => handleChange('require_visibility_approval', e.target.checked ? 'true' : 'false')}
                    className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                  />
                </label>
              </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Bildirim Ayarları</h2>
                
                <p className="text-gray-500 mb-6">
                  Hangi olaylarda bildirim almak istediğinizi seçin.
                </p>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Yeni Sipariş</p>
                      <p className="text-sm text-gray-500">Yeni sipariş geldiğinde bildirim</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Düşük Stok Uyarısı</p>
                      <p className="text-sm text-gray-500">Ürün stoğu düştüğünde bildirim</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-900">Onay Bekleyen İşlem</p>
                      <p className="text-sm text-gray-500">Personel onay istediğinde bildirim</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                    />
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
