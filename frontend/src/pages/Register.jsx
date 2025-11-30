import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, Check } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir email adresi girin'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/[A-Z]/, 'En az bir büyük harf içermeli')
    .regex(/[a-z]/, 'En az bir küçük harf içermeli')
    .regex(/[0-9]/, 'En az bir rakam içermeli'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Kullanım koşullarını kabul etmelisiniz',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
})

export default function Register() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuthStore()
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false,
    },
  })

  const password = watch('password', '')

  const passwordRequirements = [
    { label: 'En az 8 karakter', met: password.length >= 8 },
    { label: 'Bir büyük harf', met: /[A-Z]/.test(password) },
    { label: 'Bir küçük harf', met: /[a-z]/.test(password) },
    { label: 'Bir rakam', met: /[0-9]/.test(password) },
  ]

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      toast.success('Kayıt başarılı!')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kayıt başarısız')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Kayıt Ol - Perdecim</title>
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
                Perdecim
              </span>
            </Link>
            <p className="text-charcoal-500 mt-2">Yeni hesap oluşturun</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Ad</label>
                  <div className="relative">
                    <input
                      {...register('firstName')}
                      type="text"
                      placeholder="Ad"
                      className={`input pl-10 ${errors.firstName ? 'input-error' : ''}`}
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="label">Soyad</label>
                  <input
                    {...register('lastName')}
                    type="text"
                    placeholder="Soyad"
                    className={`input ${errors.lastName ? 'input-error' : ''}`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

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
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="label">Telefon (Opsiyonel)</label>
                <div className="relative">
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    className="input pl-10"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                </div>
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
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                {password && (
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className="flex items-center text-xs">
                        <Check
                          className={`w-4 h-4 mr-1 ${
                            req.met ? 'text-green-500' : 'text-charcoal-300'
                          }`}
                        />
                        <span className={req.met ? 'text-green-600' : 'text-charcoal-400'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
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
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start space-x-2">
                  <input
                    {...register('acceptTerms')}
                    type="checkbox"
                    className="mt-1 w-4 h-4 text-gold-400 border-charcoal-300 rounded focus:ring-gold-400"
                  />
                  <span className="text-sm text-charcoal-600">
                    <Link to="/terms" className="text-gold-500 hover:text-gold-600">
                      Kullanım Koşulları
                    </Link>
                    'nı ve{' '}
                    <Link to="/privacy" className="text-gold-500 hover:text-gold-600">
                      Gizlilik Politikası
                    </Link>
                    'nı okudum ve kabul ediyorum.
                  </span>
                </label>
                {errors.acceptTerms && (
                  <p className="text-red-500 text-xs mt-1">{errors.acceptTerms.message}</p>
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
                  'Kayıt Ol'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-charcoal-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-charcoal-500">veya</span>
              </div>
            </div>

            {/* Login Link */}
            <p className="text-center text-charcoal-600">
              Zaten hesabınız var mı?{' '}
              <Link
                to="/login"
                className="text-gold-500 hover:text-gold-600 font-medium"
              >
                Giriş Yapın
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
