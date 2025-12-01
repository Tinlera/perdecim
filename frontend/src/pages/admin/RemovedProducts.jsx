import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  EyeOff, 
  Eye, 
  Package, 
  Calendar, 
  User, 
  MessageSquare,
  RefreshCcw,
  Search,
  ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import { formatPrice } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function AdminRemovedProducts() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchRemovedProducts()
  }, [])

  const fetchRemovedProducts = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getRemovedProducts()
      setProducts(response.data.data)
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReturnToSale = async (productId) => {
    try {
      await adminAPI.returnToSale({ productId })
      toast.success('Ürün tekrar satışa alındı')
      fetchRemovedProducts()
    } catch (error) {
      toast.error('İşlem başarısız')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/admin/products"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Satıştan Kaldırılan Ürünler</h1>
          </div>
          <p className="text-gray-500">Bu ürünler katalogda görünmez, tekrar satışa alabilirsiniz</p>
        </div>

        {/* Search */}
        <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2 w-full sm:w-72">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none ml-3 w-full text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100">
              <div className="h-40 bg-gray-200 rounded-xl mb-4" />
              <div className="h-6 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EyeOff className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'Ürün bulunamadı' : 'Satıştan kaldırılmış ürün yok'}
          </h3>
          <p className="text-gray-500">
            {searchQuery ? 'Farklı bir arama deneyin' : 'Satıştan kaldırılan ürünler burada listelenir'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative aspect-video bg-gray-100">
                {product.featuredImage ? (
                  <img
                    src={product.featuredImage}
                    alt={product.name}
                    className="w-full h-full object-cover opacity-60 grayscale"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                
                {/* Overlay Badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-red-500/90 text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    Satışta Değil
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                  {product.name}
                </h3>
                
                <p className="text-amber-600 font-bold text-lg mb-4">
                  {formatPrice(product.price)}
                </p>

                {/* Meta */}
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  {product.removedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Kaldırılma: {new Date(product.removedAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )}
                  {product.removalReason && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 mt-0.5" />
                      <span className="line-clamp-2">{product.removalReason}</span>
                    </div>
                  )}
                </div>

                {/* Action */}
                <button
                  onClick={() => handleReturnToSale(product.id)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Tekrar Satışa Al
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

