import { Helmet } from 'react-helmet-async'
import HeroSlider from '../components/home/HeroSlider'
import CategoryShowcase from '../components/home/CategoryShowcase'
import FeaturedProducts from '../components/home/FeaturedProducts'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, Truck, Shield, HeadphonesIcon } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Sparkles,
      title: 'Premium Kalite',
      description: 'En kaliteli kumaşlar ve işçilik',
    },
    {
      icon: Truck,
      title: 'Hızlı Teslimat',
      description: '500₺ üzeri ücretsiz kargo',
    },
    {
      icon: Shield,
      title: 'Güvenli Alışveriş',
      description: '256-bit SSL güvenlik',
    },
    {
      icon: HeadphonesIcon,
      title: '7/24 Destek',
      description: 'Her zaman yanınızdayız',
    },
  ]

  return (
    <>
      <Helmet>
        <title>Perdecim - Premium Perde & Ev Tekstili</title>
        <meta
          name="description"
          content="Kaliteli perde ve ev tekstili ürünleri. Tül, fon, blackout ve stor perdeler. Ücretsiz kargo ve güvenli ödeme."
        />
      </Helmet>

      {/* Hero Slider */}
      <HeroSlider />

      {/* Features */}
      <section className="py-12 bg-white border-b border-charcoal-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-gold-100 rounded-full flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-gold-500" />
                </div>
                <h3 className="font-semibold text-charcoal-700 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-charcoal-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <CategoryShowcase />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* CTA Banner */}
      <section className="section bg-gradient-dark text-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Evinize Özel Perde Çözümleri
            </h2>
            <p className="text-charcoal-300 mb-8">
              Profesyonel ekibimiz ile evinize en uygun perde seçeneklerini birlikte
              belirleyelim. Ücretsiz ölçü ve danışmanlık hizmetimizden yararlanın.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="btn-primary">
                Ücretsiz Danışmanlık
              </Link>
              <Link to="/products" className="btn-outline border-white text-white hover:bg-white hover:text-charcoal-700">
                Ürünleri İncele
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal-700 mb-4">
              Müşterilerimiz Ne Diyor?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Ayşe Y.',
                text: 'Harika kalite ve hızlı teslimat. Perdelerim tam istediğim gibi oldu. Kesinlikle tavsiye ederim!',
                rating: 5,
              },
              {
                name: 'Mehmet K.',
                text: 'Müşteri hizmetleri çok ilgili. Ölçü konusunda yardımcı oldular ve sonuç mükemmel.',
                rating: 5,
              },
              {
                name: 'Fatma S.',
                text: 'Fiyat/performans açısından çok memnun kaldım. Blackout perdeler gerçekten karanlık yapıyor.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-charcoal-50 rounded-2xl p-6"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-gold-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-charcoal-600 mb-4">"{testimonial.text}"</p>
                <p className="font-semibold text-charcoal-700">{testimonial.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
