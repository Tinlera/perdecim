import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Award, Users, Truck, Shield } from 'lucide-react'
import { adminAPI } from '../services/api'

export default function About() {
  const [pageContent, setPageContent] = useState(null)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const response = await adminAPI.getPage('hakkimizda')
        setPageContent(response.data.data)
      } catch (error) {
        console.error('Failed to fetch page:', error)
      }
    }
    fetchPage()
  }, [])

  const features = [
    {
      icon: Award,
      title: '15+ Yıl Tecrübe',
      description: '2010\'dan bu yana sektörde hizmet veriyoruz',
    },
    {
      icon: Users,
      title: '50.000+ Mutlu Müşteri',
      description: 'Binlerce eve perde taşıdık',
    },
    {
      icon: Truck,
      title: 'Hızlı Teslimat',
      description: 'Türkiye geneli 1-3 iş günü teslimat',
    },
    {
      icon: Shield,
      title: 'Kalite Garantisi',
      description: 'Tüm ürünlerde 2 yıl garanti',
    },
  ]

  return (
    <>
      <Helmet>
        <title>{pageContent?.metaTitle || 'Hakkımızda - Perdecim'}</title>
        <meta name="description" content={pageContent?.metaDescription || 'Perdecim hakkında bilgi edinin.'} />
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
              Hakkımızda
            </h1>
            <p className="text-charcoal-300 text-lg">
              Kaliteli perde ve ev tekstili ürünleriyle yaşam alanlarınıza değer katıyoruz
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-gold-500" />
                </div>
                <h3 className="font-semibold text-charcoal-700 mb-2">{feature.title}</h3>
                <p className="text-charcoal-500 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-charcoal-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 md:p-12 shadow-lg"
            >
              {pageContent?.content ? (
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: pageContent.content }}
                />
              ) : (
                <div className="prose prose-lg max-w-none">
                  <h2>Perdecim Hakkında</h2>
                  <p>
                    2010 yılından bu yana ev tekstili sektöründe hizmet vermekteyiz. 
                    Kaliteli ürünler ve müşteri memnuniyeti odaklı çalışma anlayışımızla 
                    binlerce eve perde taşıdık.
                  </p>
                  
                  <h3>Misyonumuz</h3>
                  <p>
                    Müşterilerimize en kaliteli perde ve ev tekstili ürünlerini uygun 
                    fiyatlarla sunmak, profesyonel hizmet anlayışımızla yaşam alanlarına 
                    değer katmak.
                  </p>
                  
                  <h3>Vizyonumuz</h3>
                  <p>
                    Türkiye'nin lider online perde mağazası olmak, yenilikçi ürünler ve 
                    müşteri odaklı hizmet anlayışıyla sektörde fark yaratmak.
                  </p>
                  
                  <h3>Değerlerimiz</h3>
                  <ul>
                    <li><strong>Kalite:</strong> En iyi kumaşlar, en iyi işçilik</li>
                    <li><strong>Güven:</strong> Müşteri memnuniyeti önceliğimiz</li>
                    <li><strong>Yenilikçilik:</strong> Trendleri takip eden tasarımlar</li>
                    <li><strong>Şeffaflık:</strong> Dürüst ve açık iletişim</li>
                  </ul>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
