import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(6, 'Şifre en az 6 karakter olmalı'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
})

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Token doğrulama
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await authAPI.verifyResetToken(token)
        setIsValidToken(true)
      } catch (error) {
        setIsValidToken(false)
      } finally {
        setIsVerifying(false)
      }
    }

    if (token) {
      verifyToken()
    } else {
      setIsVerifying(false)
      setIsValidToken(false)
    }
  }, [token])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await authAPI.resetPassword({ token, newPassword: data.newPassword })
      setIsSuccess(true)
      toast.success('Şifreniz başarıyla değiştirildi')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Şifre sıfırlama başarısız')
    } finally {
      setIsLoading(false)
    }
  }

  // Yükleniyor durumu
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gold-400 mx-auto mb-4" />
          <p className="text-charcoal-500">Token doğrulanıyor...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Şifre Sıfırla - Uygunlar Ev Tekstil</title>
      </Helmet>

      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <span className="font-display text-4xl text-gold-400 font-bold">
                Uygunlar Ev Tekstil
              </span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {!isValidToken ? (
              // Invalid Token State
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-charcoal-700 mb-2">
                  Geçersiz veya Süresi Dolmuş Link
                </h2>
                <p className="text-charcoal-500 mb-6">
                  Bu şifre sıfırlama linki geçersiz veya süresi dolmuş. 
                  Lütfen yeni bir şifre sıfırlama talebinde bulunun.
                </p>
                <Link
                  to="/forgot-password"
                  className="btn-primary w-full inline-flex items-center justify-center"
                >
                  Yeni Link Talep Et
                </Link>
                <Link
                  to="/login"
                  className="mt-4 flex items-center justify-center text-charcoal-500 hover:text-charcoal-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Giriş sayfasına dön
                </Link>
              </motion.div>
            ) : isSuccess ? (
              // Success State
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-charcoal-700 mb-2">
                  Şifre Değiştirildi
                </h2>
                <p className="text-charcoal-500 mb-6">
                  Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.
                </p>
                <Link
                  to="/login"
                  className="btn-primary w-full inline-flex items-center justify-center"
                >
                  Giriş Yap
                </Link>
              </motion.div>
            ) : (
              // Form State
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-gold-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-charcoal-700">
                    Yeni Şifre Belirle
                  </h2>
                  <p className="text-charcoal-500 text-sm mt-2">
                    Hesabınız için yeni bir şifre belirleyin.
                  </p>
                </div>

                {/* New Password */}
                <div>
                  <label className="label">Yeni Şifre</label>
                  <div className="relative">
                    <input
                      {...register('newPassword')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`input pl-10 pr-10 ${errors.newPassword ? 'input-error' : ''}`}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="label">Şifre Tekrar</label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`input pl-10 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Şifreyi Değiştir'
                  )}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}

