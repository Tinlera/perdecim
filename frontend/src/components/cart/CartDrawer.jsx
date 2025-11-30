import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'
import useCartStore from '../../store/cartStore'
import { formatPrice } from '../../lib/utils'

export default function CartDrawer() {
  const {
    items,
    subtotal,
    itemCount,
    isOpen,
    isLoading,
    closeCart,
    updateCartItem,
    removeFromCart,
  } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-charcoal-100">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-gold-400" />
                <h2 className="font-display text-xl font-semibold">
                  Sepetim ({itemCount})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-charcoal-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-charcoal-200 mb-4" />
                  <p className="text-charcoal-500 mb-2">Sepetiniz boş</p>
                  <p className="text-charcoal-400 text-sm mb-6">
                    Hemen alışverişe başlayın!
                  </p>
                  <Link
                    to="/products"
                    onClick={closeCart}
                    className="btn-primary"
                  >
                    Ürünleri Keşfet
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex space-x-4 p-3 bg-charcoal-50 rounded-xl"
                  >
                    {/* Product Image */}
                    <Link
                      to={`/products/${item.product?.slug}`}
                      onClick={closeCart}
                      className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0"
                    >
                      {item.product?.featuredImage ? (
                        <img
                          src={item.product.featuredImage}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-charcoal-100">
                          <ShoppingBag className="w-8 h-8 text-charcoal-300" />
                        </div>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${item.product?.slug}`}
                        onClick={closeCart}
                        className="font-medium text-charcoal-700 hover:text-gold-400 transition-colors line-clamp-2"
                      >
                        {item.product?.name}
                      </Link>
                      {item.variant && (
                        <p className="text-sm text-charcoal-400 mt-0.5">
                          {item.variant.name}
                        </p>
                      )}
                      <p className="text-gold-500 font-semibold mt-1">
                        {formatPrice(item.price)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartItem(item.id, item.quantity - 1)}
                            disabled={isLoading || item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-charcoal-200 hover:border-gold-400 disabled:opacity-50 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItem(item.id, item.quantity + 1)}
                            disabled={isLoading}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-charcoal-200 hover:border-gold-400 disabled:opacity-50 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          disabled={isLoading}
                          className="p-1.5 text-charcoal-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-charcoal-100 p-4 space-y-4">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-500">Ara Toplam</span>
                  <span className="text-xl font-semibold text-charcoal-700">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Free Shipping Notice */}
                {subtotal < 500 && (
                  <div className="bg-gold-50 rounded-lg p-3">
                    <p className="text-sm text-gold-700">
                      <span className="font-medium">{formatPrice(500 - subtotal)}</span> daha
                      ekleyin, ücretsiz kargo kazanın!
                    </p>
                    <div className="mt-2 h-2 bg-gold-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold-400 rounded-full transition-all"
                        style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="btn-primary w-full"
                  >
                    Ödemeye Geç
                  </Link>
                  <Link
                    to="/cart"
                    onClick={closeCart}
                    className="btn-outline w-full"
                  >
                    Sepeti Görüntüle
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
