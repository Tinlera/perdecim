import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Shield, Loader2, Check, Smartphone } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/[A-Z]/, 'En az bir büyük harf içermeli')
    .regex(/[a-z]/, 'En az bir küçük harf içermeli')
    .regex(/[0-9]/, 'En az bir rakam içermeli'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
})

export default function AccountSecurity() {
  const { user, changePassword, setup2FA, disable2FA, enable2FA } = useAuthStore()
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [secret, setSecret] = useState(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [is2FALoading, setIs2FALoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema),
  })

  const onPasswordSubmit = async (data) => {
    setIsChangingPassword(true)
    try {
      await changePassword(data.currentPassword, data.newPassword)
      toast.success('Şifre değiştirildi')
      reset()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Şifre değiştirilemedi')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSetup2FA = async () => {
    setIs2FALoading(true)
    try {
      const data = await setup2FA()
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setShow2FASetup(true)
    } catch (error) {
      toast.error('2FA kurulumu başlatılamadı')
    } finally {
      setIs2FALoading(false)
    }
  }

  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast.error('6 haneli kod girin')
      return
    }

    setIs2FALoading(true)
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ token: verificationCode }),
      })

      if (response.ok) {
        enable2FA()
        setShow2FASetup(false)
        setQrCode(null)
        setSecret(null)
        setVerificationCode('')
        toast.success('2FA aktifleştirildi')
      } else {
        const data = await response.json()
        toast.error(data.message || 'Doğrulama başarısız')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    } finally {
      setIs2FALoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (disableCode.length !== 6 || !disablePassword) {
      toast.error('Kod ve şifre gerekli')
      return
    }

    setIs2FALoading(true)
    try {
      await disable2FA(disableCode, disablePassword)
      setDisableCode('')
      setDisablePassword('')
      toast.success('2FA devre dışı bırakıldı')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Devre dışı bırakılamadı')
    } finally {
      setIs2FALoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-gold-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-charcoal-700">Şifre Değiştir</h2>
            <p className="text-charcoal-500 text-sm">Hesap şifrenizi güncelleyin</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-lg">
          <div>
            <label className="label">Mevcut Şifre</label>
            <div className="relative">
              <input
                {...register('currentPassword')}
                type={showCurrentPassword ? 'text' : 'password'}
                className={`input pr-10 ${errors.currentPassword ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          <div>
            <label className="label">Yeni Şifre</label>
            <div className="relative">
              <input
                {...register('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                className={`input pr-10 ${errors.newPassword ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label className="label">Yeni Şifre (Tekrar)</label>
            <input
              {...register('confirmPassword')}
              type="password"
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="btn-primary"
          >
            {isChangingPassword ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Şifreyi Değiştir'
            )}
          </button>
        </form>
      </div>

      {/* 2FA */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-gold-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-charcoal-700">
              İki Faktörlü Doğrulama (2FA)
            </h2>
            <p className="text-charcoal-500 text-sm">
              Hesabınızı ekstra güvenlik katmanı ile koruyun
            </p>
          </div>
        </div>

        {user?.twoFactorEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 rounded-lg p-3">
              <Check className="w-5 h-5" />
              <span className="font-medium">2FA Aktif</span>
            </div>

            <div className="border-t border-charcoal-100 pt-4">
              <h3 className="font-medium text-charcoal-700 mb-3">2FA'yı Devre Dışı Bırak</h3>
              <div className="space-y-3 max-w-sm">
                <input
                  type="text"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  placeholder="6 haneli kod"
                  maxLength={6}
                  className="input"
                />
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Şifreniz"
                  className="input"
                />
                <button
                  onClick={handleDisable2FA}
                  disabled={is2FALoading}
                  className="btn-outline text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                >
                  {is2FALoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Devre Dışı Bırak'}
                </button>
              </div>
            </div>
          </div>
        ) : show2FASetup ? (
          <div className="space-y-6">
            <div className="bg-charcoal-50 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <Smartphone className="w-6 h-6 text-gold-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-charcoal-700 font-medium">1. Authenticator Uygulaması İndirin</p>
                  <p className="text-charcoal-500 text-sm mt-1">
                    Google Authenticator, Authy veya benzeri bir uygulama kullanın.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-charcoal-50 rounded-lg p-4">
              <p className="text-charcoal-700 font-medium mb-4">2. QR Kodu Tarayın</p>
              {qrCode && (
                <div className="flex justify-center">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              )}
              {secret && (
                <div className="mt-4 text-center">
                  <p className="text-charcoal-500 text-sm">veya bu kodu manuel girin:</p>
                  <code className="block mt-2 bg-white px-4 py-2 rounded font-mono text-sm">
                    {secret}
                  </code>
                </div>
              )}
            </div>

            <div className="bg-charcoal-50 rounded-lg p-4">
              <p className="text-charcoal-700 font-medium mb-4">3. Doğrulama Kodunu Girin</p>
              <div className="flex space-x-3 max-w-xs">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="input text-center text-lg tracking-widest"
                />
                <button
                  onClick={handleVerify2FA}
                  disabled={is2FALoading}
                  className="btn-primary"
                >
                  {is2FALoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Doğrula'}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setShow2FASetup(false)
                setQrCode(null)
                setSecret(null)
              }}
              className="text-charcoal-500 hover:text-charcoal-700"
            >
              İptal
            </button>
          </div>
        ) : (
          <div>
            <p className="text-charcoal-500 mb-4">
              İki faktörlü doğrulama, hesabınıza giriş yaparken şifrenize ek olarak
              telefonunuzdaki bir uygulama tarafından üretilen kod girmenizi gerektirir.
            </p>
            <button
              onClick={handleSetup2FA}
              disabled={is2FALoading}
              className="btn-primary"
            >
              {is2FALoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  2FA'yı Aktifleştir
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
