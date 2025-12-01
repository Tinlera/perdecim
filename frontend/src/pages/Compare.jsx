import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitCompare, X, ShoppingCart, Heart, ArrowLeft, Check, Minus } from 'lucide-react'
import useCompareStore from '../store/compareStore'
import useCartStore from '../store/cartStore'
import { toast } from 'react-hot-toast'

export default function Compare() {
  const navigate = useNavigate()
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore()
  const { addItem } = useCartStore()

  const handleAddToCart = async (product) => {
    try {
      await addItem(product.id, 1)
      toast.success('Ürün sepete eklendi')
    } catch (error) {
      toast.error('Ürün eklenirken hata oluştu')
    }
  }

  // Comparison attributes
  const attributes = [
    { key: 'price', label: 'Fiyat', format: (v) => v ? `₺${v.toLocaleString()}` : '-' },
    { key: 'curtainType', label: 'Perde Tipi', format: (v) => v || '-' },
    { key: 'fabricType', label: 'Kumaş Tipi', format: (v) => v || '-' },
    { key: 'lightPermeability', label: 'Işık Geçirgenliği', format: (v) => v || '-' },
    { key: 'roomType', label: 'Oda Tipi', format: (v) => v || '-' },
    { key: 'mountingType', label: 'Montaj Tipi', format: (v) => v || '-' },
    { key: 'dimensions', label: 'Boyutlar', format: (v) => v || '-' },
    { key: 'stock', label: 'Stok Durumu', format: (v) => v > 0 ? 'Stokta' : 'Tükendi' },
  ]

  if (compareItems.length === 0) {
    return (
      <>
        <Helmet>
          <title>Ürün Karşılaştırma - Uygunlar Ev Tekstil</title>
        </Helmet>

        <div className="min-h-[60vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <GitCompare className="w-12 h-12 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Karşılaştırma Listesi Boş
            </h2>
            <p className="text-gray-500 mb-6">
              Ürünleri karşılaştırmak için ürün sayfalarından ekleyin.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Ürünlere Göz At
            </Link>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Ürün Karşılaştırma - Uygunlar Ev Tekstil</title>
      </Helmet>

      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Geri Dön
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              Ürün Karşılaştırma
            </h1>
            <p className="text-gray-500 mt-1">
              {compareItems.length} ürün karşılaştırılıyor
            </p>
          </div>
          <button
            onClick={clearCompare}
            className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors"
          >
            Tümünü Temizle
          </button>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Product Images & Names */}
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-4 text-left text-gray-500 font-medium min-w-[150px]">
                    Ürün
                  </th>
                  {compareItems.map((product) => (
                    <th key={product.id} className="p-4 min-w-[200px]">
                      <div className="relative">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <Link to={`/products/${product.id}`}>
                          <img
                            src={product.featuredImage || product.images?.[0] || '/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-xl mb-3"
                          />
                          <h3 className="font-semibold text-gray-800 text-left hover:text-amber-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Attributes */}
                {attributes.map((attr, index) => (
                  <tr
                    key={attr.key}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="p-4 font-medium text-gray-700">
                      {attr.label}
                    </td>
                    {compareItems.map((product) => {
                      const value = product[attr.key]
                      const formattedValue = attr.format(value)
                      
                      return (
                        <td key={product.id} className="p-4 text-gray-600">
                          {attr.key === 'stock' ? (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              product.stock > 0 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {product.stock > 0 ? <Check className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                              {formattedValue}
                            </span>
                          ) : attr.key === 'price' ? (
                            <span className="text-xl font-bold text-amber-600">
                              {formattedValue}
                            </span>
                          ) : (
                            formattedValue
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}

                {/* Actions Row */}
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td className="p-4 font-medium text-gray-700">İşlemler</td>
                  {compareItems.map((product) => (
                    <td key={product.id} className="p-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Sepete Ekle
                        </button>
                        <Link
                          to={`/products/${product.id}`}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-amber-400 hover:text-amber-600 transition-colors"
                        >
                          Ürün Detayı
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Add more products hint */}
        {compareItems.length < 4 && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 mb-3">
              {4 - compareItems.length} ürün daha ekleyebilirsiniz
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-amber-400 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-colors"
            >
              Ürün Ekle
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

