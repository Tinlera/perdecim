import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import { usersAPI } from '../../services/api'
import { formatPrice, cn } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, isLoading: cartLoading } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    await addToCart(product.id)
  }

  const handleToggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Favorilere eklemek için giriş yapın')
      return
    }

    try {
      if (isFavorite) {
        await usersAPI.removeFavorite(product.id)
        setIsFavorite(false)
        toast.success('Favorilerden kaldırıldı')
      } else {
        await usersAPI.addFavorite(product.id)
        setIsFavorite(true)
        toast.success('Favorilere eklendi')
      }
    } catch (error) {
      toast.error('Bir hata oluştu')
    }
  }

  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPercentage = hasDiscount
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.slug}`} className="block">
        <div className="card-hover">
          {/* Image Container */}
          <div className="product-image-container aspect-square relative">
            {product.featuredImage ? (
              <img
                src={product.featuredImage}
                alt={product.name}
                className="product-image"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-charcoal-100 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-charcoal-300" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col space-y-2">
              {hasDiscount && (
                <span className="badge bg-red-500 text-white">
                  %{discountPercentage} İndirim
                </span>
              )}
              {product.isFeatured && (
                <span className="badge-gold">Öne Çıkan</span>
              )}
              {product.stock <= 0 && (
                <span className="badge bg-charcoal-500 text-white">
                  Tükendi
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute top-3 right-3 flex flex-col space-y-2"
            >
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg',
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-charcoal-500 hover:bg-gold-400 hover:text-white'
                )}
              >
                <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
              </button>
              <Link
                to={`/products/${product.slug}`}
                className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-charcoal-500 hover:bg-gold-400 hover:text-white transition-all shadow-lg"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Add to Cart Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              className="absolute bottom-3 left-3 right-3"
            >
              <button
                onClick={handleAddToCart}
                disabled={cartLoading || product.stock <= 0}
                className="w-full btn-primary py-2.5 text-sm disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {product.stock <= 0 ? 'Stokta Yok' : 'Sepete Ekle'}
              </button>
            </motion.div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            {/* Category */}
            {product.category && (
              <p className="text-xs text-charcoal-400 uppercase tracking-wide mb-1">
                {product.category.name}
              </p>
            )}

            {/* Name */}
            <h3 className="font-medium text-charcoal-700 group-hover:text-gold-500 transition-colors line-clamp-2 min-h-[48px]">
              {product.name}
            </h3>

            {/* Price */}
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-lg font-semibold text-gold-500">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-charcoal-400 line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-xs text-orange-500 mt-2">
                Son {product.stock} ürün!
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
