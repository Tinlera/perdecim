import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

// Perde konseptli görseller
const defaultSlides = [
  {
    id: 1,
    title: 'Yeni Sezon Koleksiyonu',
    subtitle: 'Evinize zarafet katın',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80',
    buttonText: 'Koleksiyonu Keşfet',
    link: '/products',
  },
  {
    id: 2,
    title: 'Premium Tül Perdeler',
    subtitle: 'Doğal ışığı evinize davet edin',
    image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=1920&q=80',
    buttonText: 'Tülleri İncele',
    link: '/products?category=tul',
  },
  {
    id: 3,
    title: 'Blackout Perdeler',
    subtitle: 'Huzurlu ve karanlık geceler için',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1920&q=80',
    buttonText: 'Alışverişe Başla',
    link: '/products?category=blackout',
  },
  {
    id: 4,
    title: 'Fon Perdeler',
    subtitle: 'Şık ve modern tasarımlar',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80',
    buttonText: 'Fon Perdeleri Gör',
    link: '/products?category=fon',
  },
]

export default function HeroSlider({ slides = defaultSlides }) {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="relative h-[60vh] md:h-[80vh] lg:h-screen">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !w-3 !h-3 !bg-white/50 !opacity-100',
          bulletActiveClass: '!bg-amber-500 !w-8 !rounded-full',
        }}
        loop
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/80 via-charcoal-900/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative h-full container-custom flex items-center">
                <AnimatePresence mode="wait">
                  {activeIndex === index && (
                    <motion.div
                      key={slide.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      transition={{ duration: 0.5 }}
                      className="max-w-xl"
                    >
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-amber-400 font-medium mb-4 tracking-wide"
                      >
                        {slide.subtitle}
                      </motion.p>
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight mb-6"
                      >
                        {slide.title}
                      </motion.h1>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Link
                          to={slide.link}
                          className="inline-flex items-center bg-gradient-to-r from-amber-500 to-amber-600 text-charcoal-900 font-semibold text-lg px-8 py-4 rounded-full hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
                        >
                          {slide.buttonText}
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Link>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:block"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-3 bg-amber-500 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  )
}
