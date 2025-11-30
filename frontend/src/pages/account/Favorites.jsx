import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { usersAPI } from '../../services/api'
import useCartStore from '../../store/cartStore'
import { formatPrice } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function AccountFavorites() {
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { addToCart } = useCartStore()

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const response = await usersAPI.getFavorites()
      setFavorites(response.data.data)
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (productId) => {
    try {
      await usersAPI.removeFavorite(productId)
      setFavorites(favorites.filter((f) => f.id !== productId))
      toast.success('Favorilerden kaldırıldı')
    } catch (error) {
      toast.error('Bir hata oluştu')
    }
  }

  const handleAddToCart = async (productId) => {
    await addToCart(productId)
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-xl font-semibold text-charcoal-700 mb-6">Favorilerim</h2>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-charcoal-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
          <p className="text-charcoal-500 mb-4">Favorileriniz boş</p>
          <Link to="/products" className="btn-primary">
            Ürünleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {favorites.map((product) => (
            <div key={product.id} className="group relative">
              <Link to={`/products/${product.slug}`}>
                <div className="aspect-square bg-charcoal-100 rounded-lg overflow-hidden">
                  {product.featuredImage ? (
                    <img
                      src={product.featuredImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-charcoal-300" />
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <h3 className="font-medium text-charcoal-700 line-clamp-2 group-hover:text-gold-500 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gold-500 font-semibold mt-1">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </Link>

              {/* Actions */}
              <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRemove(product.id)}
                  className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-charcoal-500 hover:bg-gold-400 hover:text-white transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
