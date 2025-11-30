import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import ProductCard from '../product/ProductCard'
import { productsAPI } from '../../services/api'

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productsAPI.getAll({ featured: 'true', limit: 8 })
        setProducts(response.data.data.products)
      } catch (error) {
        console.error('Failed to fetch featured products:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (isLoading) {
    return (
      <section className="section bg-charcoal-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="h-8 w-48 bg-charcoal-200 rounded mx-auto mb-4 animate-pulse" />
            <div className="h-4 w-64 bg-charcoal-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden">
                <div className="aspect-square bg-charcoal-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-charcoal-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-charcoal-200 rounded animate-pulse" />
                  <div className="h-6 w-1/3 bg-charcoal-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="section bg-charcoal-50">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal-700 mb-4">
            Öne Çıkan Ürünler
          </h2>
          <p className="text-charcoal-500 max-w-2xl mx-auto">
            En çok tercih edilen ve beğenilen ürünlerimizi keşfedin
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/products"
            className="btn-outline inline-flex items-center"
          >
            Tüm Ürünleri Gör
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
