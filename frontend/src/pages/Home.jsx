import { Helmet } from 'react-helmet-async'
import HeroSlider from '../components/home/HeroSlider'
import CategoryShowcase from '../components/home/CategoryShowcase'
import FeaturedProducts from '../components/home/FeaturedProducts'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, Truck, Shield, HeadphonesIcon, Star, ArrowRight, Play } from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: Sparkles,
      title: 'Premium Kalite',
      description: 'İtalyan kumaşlar, el işçiliği detaylar',
    },
    {
      icon: Truck,
      title: 'Ücretsiz Kurulum',
      description: 'Profesyonel montaj hizmeti',
    },
    {
      icon: Shield,
      title: '2 Yıl Garanti',
      description: 'Tam güvence ile alışveriş',
    },
    {
      icon: HeadphonesIcon,
      title: 'VIP Danışmanlık',
      description: 'Kişiye özel tasarım desteği',
    },
  ]

  const stats = [
    { value: '15+', label: 'Yıllık Deneyim' },
    { value: '50K+', label: 'Mutlu Müşteri' },
    { value: '1000+', label: 'Ürün Çeşidi' },
    { value: '81', label: 'İl\'e Teslimat' },
  ]

  return (
    <>
      <Helmet>
        <title>Perdecim - Lüks Perde & Ev Tekstili Koleksiyonu</title>
        <meta
          name="description"
          content="Premium perde koleksiyonları ve ev tekstili. İtalyan kumaşlar, özel tasarımlar. Ücretsiz kurulum ve 2 yıl garanti."
        />
      </Helmet>

      {/* Hero Slider */}
      <HeroSlider />

      {/* Marquee Banner */}
      <div className="bg-charcoal-900 py-3 overflow-hidden">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-8 mx-8">
              <span className="text-gold-400 font-medium">✦ ÜCRETSİZ KARGO</span>
              <span className="text-charcoal-400">•</span>
              <span className="text-white/80">500₺ Üzeri Siparişlerde</span>
              <span className="text-charcoal-400">•</span>
              <span className="text-gold-400 font-medium">✦ ÜCRETSİZ MONTAJ</span>
              <span className="text-charcoal-400">•</span>
              <span className="text-white/80">Profesyonel Ekip</span>
              <span className="text-charcoal-400">•</span>
              <span className="text-gold-400 font-medium">✦ 2 YIL GARANTİ</span>
              <span className="text-charcoal-400">•</span>
              <span className="text-white/80">Tüm Ürünlerde</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-cream-50 to-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
        
        <div className="container-custom relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center group"
              >
                <div className="relative w-20 h-20 mx-auto mb-6">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gold-400/20 rounded-2xl blur-xl group-hover:bg-gold-400/40 transition-all duration-500" />
                  {/* Icon container */}
                  <div className="relative w-full h-full bg-gradient-to-br from-gold-100 to-gold-200 rounded-2xl flex items-center justify-center border border-gold-300/30 group-hover:scale-110 transition-transform duration-500">
                    <feature.icon className="w-8 h-8 text-gold-600" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="font-display text-lg font-semibold text-charcoal-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-charcoal-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-charcoal-900 relative overflow-hidden">
        {/* Gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
        
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-display font-bold text-gradient-premium mb-2">
                  {stat.value}
                </div>
                <div className="text-charcoal-400 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <CategoryShowcase />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Luxury CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-charcoal-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615873968403-89e068629265?q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-900/95 to-charcoal-900" />
        
        {/* Gold decorative elements */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl -translate-y-1/2" />
        
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block text-gold-400 text-sm font-medium tracking-[0.3em] uppercase mb-6">
              Özel Tasarım Hizmeti
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">
              Hayalinizdeki Perdeyi
              <span className="block text-gradient-premium">Birlikte Tasarlayalım</span>
            </h2>
            <p className="text-charcoal-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Uzman ekibimiz ile evinize özel, benzersiz perde tasarımları oluşturun. 
              Ücretsiz ev ziyareti ve ölçü hizmetimizden yararlanın.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/contact" 
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-charcoal-900 px-8 py-4 rounded-full font-semibold hover:shadow-gold-lg transition-all duration-500"
              >
                Ücretsiz Randevu Al
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group inline-flex items-center gap-3 text-white px-8 py-4 rounded-full font-medium border border-white/20 hover:border-gold-400/50 hover:bg-white/5 transition-all duration-300">
                <div className="w-10 h-10 rounded-full bg-gold-400/20 flex items-center justify-center group-hover:bg-gold-400/30 transition-colors">
                  <Play className="w-4 h-4 text-gold-400 ml-0.5" fill="currentColor" />
                </div>
                Showroom Turu
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-cream-50 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-20 right-20 text-[200px] font-display text-gold-400/5 select-none">
          "
        </div>
        
        <div className="container-custom relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block text-gold-500 text-sm font-medium tracking-[0.2em] uppercase mb-4">
              Müşteri Yorumları
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-charcoal-800">
              Mutlu Müşterilerimiz
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Ayşe Yılmaz',
                role: 'Ev Sahibi',
                image: 'https://randomuser.me/api/portraits/women/44.jpg',
                text: 'Perdecim ile çalışmak muhteşem bir deneyimdi. Kalite ve hizmet anlayışları gerçekten üst düzey. Evimin tamamına perde yaptırdım ve sonuç beklentilerimin çok üzerinde.',
                rating: 5,
              },
              {
                name: 'Mehmet Kaya',
                role: 'İç Mimar',
                image: 'https://randomuser.me/api/portraits/men/32.jpg',
                text: 'Projelerimde sürekli Perdecim ürünlerini tercih ediyorum. Kumaş kalitesi ve renk seçenekleri rakipsiz. Müşterilerim her zaman çok memnun kalıyor.',
                rating: 5,
              },
              {
                name: 'Fatma Şahin',
                role: 'Otel Yöneticisi',
                image: 'https://randomuser.me/api/portraits/women/68.jpg',
                text: 'Otelimizin tüm odaları için blackout perde aldık. Hem estetik hem de fonksiyonel olarak mükemmel. Profesyonel montaj ekibi işini çok iyi yapıyor.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="bg-white rounded-3xl p-8 shadow-elegant border border-charcoal-100/50 hover:shadow-premium transition-shadow duration-500"
              >
                {/* Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-gold-400"
                      fill="currentColor"
                    />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-charcoal-600 leading-relaxed mb-8 text-lg">
                  "{testimonial.text}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-gold-400/20"
                  />
                  <div>
                    <p className="font-semibold text-charcoal-800">{testimonial.name}</p>
                    <p className="text-sm text-charcoal-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 rounded-4xl p-12 md:p-16 relative overflow-hidden">
              {/* Decorative */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl" />
              
              <div className="relative">
                <span className="inline-block text-gold-400 text-sm font-medium tracking-[0.2em] uppercase mb-4">
                  Bülten
                </span>
                <h3 className="font-display text-3xl md:text-4xl text-white mb-4">
                  Özel Fırsatları Kaçırmayın
                </h3>
                <p className="text-charcoal-300 mb-8 max-w-xl mx-auto">
                  Yeni koleksiyonlar, özel indirimler ve dekorasyon ipuçları için bültenimize abone olun.
                </p>
                
                <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="E-posta adresiniz"
                    className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-charcoal-400 focus:outline-none focus:border-gold-400 transition-colors"
                  />
                  <button className="px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-charcoal-900 rounded-full font-semibold hover:shadow-gold-lg transition-all duration-300">
                    Abone Ol
                  </button>
                </form>
                
                <p className="text-charcoal-500 text-sm mt-4">
                  Gizliliğinize saygı duyuyoruz. İstediğiniz zaman abonelikten çıkabilirsiniz.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
