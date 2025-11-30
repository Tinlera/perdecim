import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { MapPin, Phone, Mail, Clock, Send, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    // Simüle edilmiş form gönderimi
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Mesajınız gönderildi! En kısa sürede dönüş yapacağız.')
    reset()
    setIsSubmitting(false)
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Adres',
      content: 'Örnek Mahallesi, Perde Sokak No:1\nKadıköy, İstanbul',
    },
    {
      icon: Phone,
      title: 'Telefon',
      content: '+90 (212) 123 45 67',
      link: 'tel:+902121234567',
    },
    {
      icon: Mail,
      title: 'E-posta',
      content: 'info@perdecim.com',
      link: 'mailto:info@perdecim.com',
    },
    {
      icon: Clock,
      title: 'Çalışma Saatleri',
      content: 'Pazartesi - Cumartesi\n09:00 - 18:00',
    },
  ]

  return (
    <>
      <Helmet>
        <title>İletişim - Perdecim</title>
        <meta name="description" content="Perdecim iletişim bilgileri. Bize ulaşın." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-dark text-white py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              İletişim
            </h1>
            <p className="text-charcoal-300 text-lg">
              Sorularınız için bize ulaşın, size yardımcı olmaktan mutluluk duyarız
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-charcoal-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-gold-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal-700 mb-1">
                        {item.title}
                      </h3>
                      {item.link ? (
                        <a
                          href={item.link}
                          className="text-charcoal-500 hover:text-gold-500 transition-colors whitespace-pre-line"
                        >
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-charcoal-500 whitespace-pre-line">
                          {item.content}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="font-display text-2xl font-bold text-charcoal-700 mb-6">
                  Bize Mesaj Gönderin
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Ad Soyad</label>
                      <input
                        {...register('name', { required: 'Ad soyad gerekli' })}
                        className={`input ${errors.name ? 'input-error' : ''}`}
                        placeholder="Adınız Soyadınız"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="label">E-posta</label>
                      <input
                        {...register('email', {
                          required: 'E-posta gerekli',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Geçerli bir e-posta girin',
                          },
                        })}
                        type="email"
                        className={`input ${errors.email ? 'input-error' : ''}`}
                        placeholder="ornek@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Telefon</label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="input"
                        placeholder="05XX XXX XX XX"
                      />
                    </div>
                    <div>
                      <label className="label">Konu</label>
                      <select {...register('subject')} className="input">
                        <option value="general">Genel Bilgi</option>
                        <option value="order">Sipariş Hakkında</option>
                        <option value="return">İade/Değişim</option>
                        <option value="complaint">Şikayet</option>
                        <option value="other">Diğer</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Mesajınız</label>
                    <textarea
                      {...register('message', { required: 'Mesaj gerekli' })}
                      rows={5}
                      className={`input ${errors.message ? 'input-error' : ''}`}
                      placeholder="Mesajınızı buraya yazın..."
                    />
                    {errors.message && (
                      <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Gönder
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.6504900584!2d29.0234!3d40.9876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDU5JzE1LjQiTiAyOcKwMDEnMjQuMiJF!5e0!3m2!1str!2str!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Perdecim Konum"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
