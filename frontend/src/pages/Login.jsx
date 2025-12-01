import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(1, 'Şifre gerekli'),
})

const twoFASchema = z.object({
  token: z.string().length(6, '6 haneli kod girin'),
})

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, verify2FA, require2FA, cancel2FA } = useAuthStore()
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const {
    register: register2FA,
    handleSubmit: handleSubmit2FA,
    formState: { errors: errors2FA },
  } = useForm({
    resolver: zodResolver(twoFASchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const result = await login(data.email, data.password)
      
      if (result.require2FA) {
        toast.success('2FA kodu gerekli')
      } else {
        toast.success('Giriş başarılı')
        navigate(result.redirectPath || from, { replace: true })
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Giriş başarısız')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit2FA = async (data) => {
    setIsLoading(true)
    try {
      const result = await verify2FA(data.token)
      toast.success('Giriş başarılı')
      navigate(result.redirectPath || from, { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Doğrulama başarısız')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Giriş Yap - Uygunlar Ev Tekstil</title>
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
            <p className="text-charcoal-500 mt-2">Hesabınıza giriş yapın</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {require2FA ? (
              // 2FA Form
              <form onSubmit={handleSubmit2FA(onSubmit2FA)} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-gold-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-charcoal-700">
                    İki Faktörlü Doğrulama
                  </h2>
                  <p className="text-charcoal-500 text-sm mt-2">
                    Authenticator uygulamanızdaki 6 haneli kodu girin
                  </p>
                </div>

                <div>
                  <input
                    {...register2FA('token')}
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="input text-center text-2xl tracking-widest"
                    autoFocus
                  />
                  {errors2FA.token && (
                    <p className="text-red-500 text-sm mt-1">{errors2FA.token.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Doğrula'
                  )}
                </button>

                <button
                  type="button"
                  onClick={cancel2FA}
                  className="w-full text-center text-charcoal-500 hover:text-charcoal-700"
                >
                  Geri Dön
                </button>
              </form>
            ) : (
              // Login Form
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="label">Email</label>
                  <div className="relative">
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="ornek@email.com"
                      className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="label">Şifre</label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
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
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-gold-500 hover:text-gold-600"
                  >
                    Şifremi Unuttum
                  </Link>
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
                    'Giriş Yap'
                  )}
                </button>
              </form>
            )}

            {/* Divider */}
            {!require2FA && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-charcoal-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-charcoal-500">veya</span>
                  </div>
                </div>

                {/* Register Link */}
                <p className="text-center text-charcoal-600">
                  Hesabınız yok mu?{' '}
                  <Link
                    to="/register"
                    className="text-gold-500 hover:text-gold-600 font-medium"
                  >
                    Kayıt Olun
                  </Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}
