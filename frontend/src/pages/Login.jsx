import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import useAuthStore from '../store/authStore'
import { authAPI, adminAPI } from '../services/api'
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
  const { login, verify2FA, require2FA, cancel2FA, setAuth } = useAuthStore()
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleEnabled, setGoogleEnabled] = useState(false)
  const [googleClientId, setGoogleClientId] = useState('')

  const from = location.state?.from?.pathname || '/'

  // Check if Google OAuth is enabled
  useEffect(() => {
    const checkGoogleAuth = async () => {
      try {
        const response = await adminAPI.getSettings('auth')
        const settings = {}
        response.data.data.forEach(s => { settings[s.key] = s.value })
        
        if (settings.google_oauth_enabled === 'true' && settings.google_client_id) {
          setGoogleEnabled(true)
          setGoogleClientId(settings.google_client_id)
        }
      } catch (error) {
        console.error('Failed to check Google auth:', error)
      }
    }
    checkGoogleAuth()
  }, [])

  // Initialize Google Sign-In
  useEffect(() => {
    if (googleEnabled && googleClientId && window.google) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCallback,
      })
      
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' }
      )
    }
  }, [googleEnabled, googleClientId])

  const handleGoogleCallback = async (response) => {
    setIsLoading(true)
    try {
      // Decode JWT to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]))
      
      const result = await authAPI.googleAuth({
        googleId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        avatar: payload.picture
      })
      
      const { user, accessToken, refreshToken, redirectPath } = result.data.data
      
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      setAuth(user, accessToken, refreshToken)
      toast.success('Google ile giriş başarılı')
      navigate(redirectPath || from, { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google ile giriş başarısız')
    } finally {
      setIsLoading(false)
    }
  }

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

            {/* Divider & Social Login */}
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

                {/* Google Sign-In */}
                {googleEnabled && (
                  <div className="mb-6">
                    <div id="google-signin-button" className="flex justify-center" />
                    {!window.google && (
                      <button
                        type="button"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-charcoal-200 rounded-xl hover:bg-charcoal-50 transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google ile Giriş Yap
                      </button>
                    )}
                  </div>
                )}

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
