import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ruler, Package, Truck, Wrench, Shield, Clock } from 'lucide-react'
import FreeMeasurementService from '../ui/FreeMeasurementService'

const services = [
  {
    icon: Ruler,
    title: 'Ücretsiz Ölçü Hizmeti',
    description: 'Uzman ekibimiz evinize gelerek profesyonel ölçüm yapar.',
    color: 'from-amber-400 to-amber-600',
    action: 'measurement',
  },
  {
    icon: Package,
    title: 'Kumaş Numune',
    description: 'Beğendiğiniz kumaşın numunesi kapınıza gelsin.',
    color: 'from-rose-400 to-rose-600',
    action: 'sample',
  },
  {
    icon: Truck,
    title: 'Ücretsiz Kargo',
    description: '500 TL ve üzeri alışverişlerde kargo bedava.',
    color: 'from-blue-400 to-blue-600',
    action: null,
  },
  {
    icon: Wrench,
    title: 'Profesyonel Montaj',
    description: 'Perdelerinizi uzman ekibimiz takıyor.',
    color: 'from-emerald-400 to-emerald-600',
    action: null,
  },
  {
    icon: Shield,
    title: '2 Yıl Garanti',
    description: 'Tüm ürünlerimiz 2 yıl garantilidir.',
    color: 'from-purple-400 to-purple-600',
    action: null,
  },
  {
    icon: Clock,
    title: 'Hızlı Teslimat',
    description: 'Siparişiniz 3-5 iş günü içinde kapınızda.',
    color: 'from-orange-400 to-orange-600',
    action: null,
  },
]

export default function ServicesSection() {
  const [isMeasurementOpen, setIsMeasurementOpen] = useState(false)

  const handleAction = (action) => {
    if (action === 'measurement') {
      setIsMeasurementOpen(true)
    }
    // Sample request would typically open a product selector first
  }

  return (
    <>
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-amber-50/30">
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-charcoal-800 mb-4">
              Hizmetlerimiz
            </h2>
            <p className="text-charcoal-500 max-w-2xl mx-auto">
              Sizin için en iyisini sunmak üzere tasarlanmış özel hizmetlerimiz
            </p>
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => service.action && handleAction(service.action)}
                className={`group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 ${
                  service.action ? 'cursor-pointer' : ''
                }`}
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <service.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-800 mb-2 group-hover:text-amber-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-charcoal-500 text-sm">{service.description}</p>
                {service.action && (
                  <div className="mt-4">
                    <span className="text-amber-600 text-sm font-semibold group-hover:underline">
                      Hemen Talep Et →
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-gradient-to-r from-charcoal-800 to-charcoal-900 rounded-2xl p-8 lg:p-12 text-center relative overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
                }}
              />
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                Evinize Özel Ücretsiz Danışmanlık
              </h3>
              <p className="text-charcoal-300 mb-6 max-w-2xl mx-auto">
                Uzman dekorasyon danışmanlarımız evinizi ziyaret ederek size özel perde ve
                dekorasyon önerileri sunsun.
              </p>
              <button
                onClick={() => setIsMeasurementOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-charcoal-900 font-bold rounded-xl hover:shadow-2xl hover:shadow-amber-500/30 transition-all"
              >
                <Ruler className="w-5 h-5" />
                Ücretsiz Randevu Al
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Measurement Modal */}
      <FreeMeasurementService
        isOpen={isMeasurementOpen}
        onClose={() => setIsMeasurementOpen(false)}
      />
    </>
  )
}

