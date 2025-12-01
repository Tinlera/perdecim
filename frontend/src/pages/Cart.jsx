import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import useCartStore from '../store/cartStore'
import { formatPrice } from '../lib/utils'

export default function Cart() {
  const {
    items,
    subtotal,
    itemCount,
    isLoading,
    fetchCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCartStore()

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const shippingCost = subtotal >= 500 ? 0 : 29.90
  const total = subtotal + shippingCost

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Sepetim - Uygunlar Ev Tekstil</title>
        </Helmet>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="w-20 h-20 text-charcoal-200 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-charcoal-700 mb-2">
              Sepetiniz Boş
            </h1>
            <p className="text-charcoal-500 mb-6">
              Hemen alışverişe başlayın!
            </p>
            <Link to="/products" className="btn-primary">
              Ürünleri Keşfet
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Sepetim ({itemCount}) - Uygunlar Ev Tekstil</title>
      </Helmet>

      <div className="min-h-screen bg-charcoal-50 py-8">
        <div className="container-custom">
          <h1 className="font-display text-3xl font-bold text-charcoal-700 mb-8">
            Sepetim ({itemCount} Ürün)
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-4"
                >
                  {/* Product Image */}
                  <Link
                    to={`/products/${item.product?.slug}`}
                    className="w-full md:w-32 h-32 bg-charcoal-100 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    {item.product?.featuredImage ? (
                      <img
                        src={item.product.featuredImage}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-charcoal-300" />
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link
                      to={`/products/${item.product?.slug}`}
                      className="font-medium text-charcoal-700 hover:text-gold-500 transition-colors"
                    >
                      {item.product?.name}
                    </Link>
                    {item.variant && (
                      <p className="text-charcoal-500 text-sm mt-1">
                        Seçenek: {item.variant.name}
                      </p>
                    )}
                    <p className="text-gold-500 font-semibold mt-2">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity & Actions */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity - 1)}
                          disabled={isLoading || item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-charcoal-200 hover:border-gold-400 disabled:opacity-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          disabled={isLoading}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-charcoal-200 hover:border-gold-400 disabled:opacity-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="font-semibold text-charcoal-700">
                          {formatPrice(item.total)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          disabled={isLoading}
                          className="p-2 text-charcoal-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Clear Cart */}
              <div className="flex justify-end">
                <button
                  onClick={clearCart}
                  disabled={isLoading}
                  className="text-charcoal-500 hover:text-red-500 text-sm transition-colors"
                >
                  Sepeti Temizle
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 sticky top-24">
                <h2 className="font-semibold text-charcoal-700 mb-4">
                  Sipariş Özeti
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Ara Toplam</span>
                    <span className="text-charcoal-700">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Kargo</span>
                    <span className="text-charcoal-700">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Ücretsiz</span>
                      ) : (
                        formatPrice(shippingCost)
                      )}
                    </span>
                  </div>
                  
                  {/* Free Shipping Progress */}
                  {subtotal < 500 && (
                    <div className="bg-gold-50 rounded-lg p-3 mt-4">
                      <p className="text-sm text-gold-700 mb-2">
                        <span className="font-medium">{formatPrice(500 - subtotal)}</span> daha
                        ekleyin, ücretsiz kargo kazanın!
                      </p>
                      <div className="h-2 bg-gold-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold-400 rounded-full transition-all"
                          style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="border-t border-charcoal-100 pt-3 mt-3 flex justify-between">
                    <span className="font-semibold text-charcoal-700">Toplam</span>
                    <span className="font-bold text-xl text-gold-500">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="btn-primary w-full mt-6"
                >
                  Ödemeye Geç
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>

                <Link
                  to="/products"
                  className="block text-center text-charcoal-500 hover:text-gold-500 mt-4 text-sm"
                >
                  Alışverişe Devam Et
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
