import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { categoriesAPI } from '../../services/api'

// Demo categories - gerçek uygulamada API'den gelecek
const defaultCategories = [
  {
    id: 1,
    name: 'Tül Perdeler',
    slug: 'tul-perdeler',
    image: 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=600&q=80',
    productCount: 45,
  },
  {
    id: 2,
    name: 'Fon Perdeler',
    slug: 'fon-perdeler',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
    productCount: 38,
  },
  {
    id: 3,
    name: 'Blackout Perdeler',
    slug: 'blackout-perdeler',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80',
    productCount: 24,
  },
  {
    id: 4,
    name: 'Stor Perdeler',
    slug: 'stor-perdeler',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
    productCount: 32,
  },
]

export default function CategoryShowcase() {
  const [categories, setCategories] = useState(defaultCategories)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll()
        if (response.data.data.length > 0) {
          setCategories(response.data.data.slice(0, 4))
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return (
    <section className="section">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal-700 mb-4">
            Kategoriler
          </h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            İhtiyacınıza uygun perde kategorilerini keşfedin
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/products?category=${category.slug}`}
                className="group block relative aspect-[4/5] rounded-2xl overflow-hidden"
              >
                {/* Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="font-display text-xl md:text-2xl text-white font-semibold mb-1">
                    {category.name}
                  </h3>
                  <p className="text-white/70 text-sm mb-3">
                    {category.productCount || 0} Ürün
                  </p>
                  <div className="flex items-center text-gold-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Keşfet
                    <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Hover Border */}
                <div className="absolute inset-0 border-2 border-gold-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/categories"
            className="btn-outline inline-flex items-center"
          >
            Tüm Kategoriler
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
