import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir email adresi girin'),
})

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await authAPI.forgotPassword(data)
      setIsSubmitted(true)
      toast.success('Şifre sıfırlama bağlantısı gönderildi')
    } catch (error) {
      // Güvenlik için her durumda aynı mesajı göster
      setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Şifremi Unuttum - Perdecim</title>
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
            <p className="text-charcoal-500 mt-2">Şifrenizi sıfırlayın</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {isSubmitted ? (
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
                  Email Gönderildi
                </h2>
                <p className="text-charcoal-500 mb-6">
                  Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama 
                  bağlantısı içeren bir email gönderildi. Lütfen gelen kutunuzu 
                  (ve spam klasörünü) kontrol edin.
                </p>
                <Link
                  to="/login"
                  className="btn-primary w-full inline-flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Giriş Sayfasına Dön
                </Link>
              </motion.div>
            ) : (
              // Form State
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-gold-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-charcoal-700">
                    Şifremi Unuttum
                  </h2>
                  <p className="text-charcoal-500 text-sm mt-2">
                    Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="label">Email Adresi</label>
                  <div className="relative">
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="ornek@email.com"
                      className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                      autoFocus
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
                    'Şifre Sıfırlama Linki Gönder'
                  )}
                </button>

                {/* Back to Login */}
                <Link
                  to="/login"
                  className="flex items-center justify-center text-charcoal-500 hover:text-charcoal-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Giriş sayfasına dön
                </Link>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}

