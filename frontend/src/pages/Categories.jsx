import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ChevronRight, Loader2 } from 'lucide-react'
import { categoriesAPI } from '../services/api'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll()
        setCategories(response.data.data || [])
      } catch (error) {
        console.error('Kategoriler yüklenemedi:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Kategorileri parent-child yapısına göre düzenle
  const parentCategories = categories.filter(cat => !cat.parentId)
  const getChildren = (parentId) => categories.filter(cat => cat.parentId === parentId)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-gold-400" />
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Kategoriler - Uygunlar Ev Tekstil</title>
        <meta name="description" content="Tüm perde ve ev tekstili kategorilerimizi keşfedin. Tül, fon, blackout, stor perdeler ve daha fazlası." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-dark py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl text-white font-bold mb-4">
              Kategoriler
            </h1>
            <p className="text-charcoal-300 text-lg max-w-2xl mx-auto">
              Evinize en uygun perde ve ev tekstili ürünlerini kategorilere göre keşfedin.
            </p>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-400 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section">
        <div className="container-custom">
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-charcoal-500 text-lg">Henüz kategori bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {parentCategories.map((category, index) => {
                const children = getChildren(category.id)
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    {/* Main Category Card */}
                    <Link
                      to={`/categories/${category.slug}`}
                      className="block relative overflow-hidden rounded-2xl aspect-[4/3] mb-4"
                    >
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gold-200 to-gold-400" />
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-6">
                        <h2 className="font-display text-2xl text-white font-bold mb-2">
                          {category.name}
                        </h2>
                        {category.description && (
                          <p className="text-white/80 text-sm line-clamp-2">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center text-gold-400 mt-3 group-hover:translate-x-2 transition-transform">
                          <span className="text-sm font-medium">Ürünleri Gör</span>
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </Link>

                    {/* Sub Categories */}
                    {children.length > 0 && (
                      <div className="space-y-2 pl-4">
                        {children.map(child => (
                          <Link
                            key={child.id}
                            to={`/categories/${child.slug}`}
                            className="flex items-center text-charcoal-500 hover:text-gold-500 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4 mr-2 text-gold-400" />
                            <span>{child.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-charcoal-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl font-bold text-charcoal-700 mb-4">
              Aradığınızı Bulamadınız mı?
            </h2>
            <p className="text-charcoal-500 mb-6">
              Özel sipariş ve özel tasarım talepleriniz için bizimle iletişime geçin. 
              Size en uygun çözümü sunalım.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/products" className="btn-primary">
                Tüm Ürünler
              </Link>
              <Link to="/contact" className="btn-outline">
                İletişime Geç
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

