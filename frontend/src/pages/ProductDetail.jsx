import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Thumbs, Zoom } from 'swiper/modules'
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Check,
} from 'lucide-react'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import { productsAPI, usersAPI } from '../services/api'
import { formatPrice, cn } from '../lib/utils'
import toast from 'react-hot-toast'

import 'swiper/css'
import 'swiper/css/thumbs'
import 'swiper/css/zoom'

export default function ProductDetail() {
  const { slug } = useParams()
  const { addToCart, isLoading: cartLoading } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [thumbsSwiper, setThumbsSwiper] = useState(null)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        const response = await productsAPI.getBySlug(slug)
        setProduct(response.data.data)
        if (response.data.data.variants?.length > 0) {
          setSelectedVariant(response.data.data.variants[0])
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [slug])

  const handleAddToCart = async () => {
    await addToCart(product.id, selectedVariant?.id, quantity)
  }

  const handleToggleFavorite = async () => {
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

  const currentPrice = selectedVariant?.price || product?.price
  const currentStock = selectedVariant?.stock ?? product?.stock
  const hasDiscount = product?.comparePrice && product.comparePrice > currentPrice

  const allImages = product
    ? [product.featuredImage, ...(product.images || [])].filter(Boolean)
    : []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-50 py-8">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-charcoal-200 rounded-xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-charcoal-200 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-charcoal-200 rounded w-1/4 animate-pulse" />
              <div className="h-24 bg-charcoal-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal-700 mb-4">
            Ürün Bulunamadı
          </h1>
          <Link to="/products" className="btn-primary">
            Ürünlere Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{product.metaTitle || product.name} - Uygunlar Ev Tekstil</title>
        <meta
          name="description"
          content={product.metaDescription || product.shortDescription}
        />
      </Helmet>

      <div className="min-h-screen bg-charcoal-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-charcoal-100">
          <div className="container-custom py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-charcoal-400 hover:text-gold-500">
                Ana Sayfa
              </Link>
              <ChevronRight className="w-4 h-4 text-charcoal-300" />
              <Link to="/products" className="text-charcoal-400 hover:text-gold-500">
                Ürünler
              </Link>
              {product.category && (
                <>
                  <ChevronRight className="w-4 h-4 text-charcoal-300" />
                  <Link
                    to={`/products?category=${product.category.slug}`}
                    className="text-charcoal-400 hover:text-gold-500"
                  >
                    {product.category.name}
                  </Link>
                </>
              )}
              <ChevronRight className="w-4 h-4 text-charcoal-300" />
              <span className="text-charcoal-600">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Main Image */}
              <div className="bg-white rounded-xl overflow-hidden mb-4">
                <Swiper
                  modules={[Thumbs, Zoom]}
                  thumbs={{ swiper: thumbsSwiper }}
                  zoom
                  className="aspect-square"
                >
                  {allImages.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div className="swiper-zoom-container">
                        <img
                          src={image}
                          alt={`${product.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <Swiper
                  modules={[Thumbs]}
                  onSwiper={setThumbsSwiper}
                  slidesPerView={4}
                  spaceBetween={12}
                  watchSlidesProgress
                  className="thumbs-swiper"
                >
                  {allImages.map((image, index) => (
                    <SwiperSlide key={index}>
                      <div className="aspect-square bg-white rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-gold-400 transition-colors">
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Category */}
              {product.category && (
                <Link
                  to={`/products?category=${product.category.slug}`}
                  className="text-sm text-gold-500 hover:text-gold-600 uppercase tracking-wide"
                >
                  {product.category.name}
                </Link>
              )}

              {/* Name */}
              <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal-700 mt-2 mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-gold-500">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-charcoal-400 line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                    <span className="badge bg-red-500 text-white">
                      %{Math.round(((product.comparePrice - currentPrice) / product.comparePrice) * 100)} İndirim
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-charcoal-600 mb-6">{product.shortDescription}</p>
              )}

              {/* Variants */}
              {product.variants?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-charcoal-700 mb-3">Seçenekler</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={cn(
                          'px-4 py-2 rounded-lg border-2 transition-all',
                          selectedVariant?.id === variant.id
                            ? 'border-gold-400 bg-gold-50 text-gold-700'
                            : 'border-charcoal-200 hover:border-gold-400'
                        )}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-medium text-charcoal-700 mb-3">Adet</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-charcoal-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-charcoal-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-charcoal-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-charcoal-500">
                    {currentStock > 0 ? `${currentStock} adet stokta` : 'Stokta yok'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading || currentStock <= 0}
                  className="flex-1 btn-primary py-4 text-lg disabled:opacity-50"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {currentStock <= 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className={cn(
                    'w-14 h-14 rounded-lg border-2 flex items-center justify-center transition-all',
                    isFavorite
                      ? 'border-red-500 bg-red-50 text-red-500'
                      : 'border-charcoal-200 hover:border-gold-400 text-charcoal-500'
                  )}
                >
                  <Heart className={cn('w-6 h-6', isFavorite && 'fill-current')} />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-charcoal-50 rounded-xl">
                <div className="text-center">
                  <Truck className="w-6 h-6 mx-auto mb-2 text-gold-500" />
                  <p className="text-xs text-charcoal-600">Ücretsiz Kargo</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-gold-500" />
                  <p className="text-xs text-charcoal-600">Güvenli Ödeme</p>
                </div>
                <div className="text-center">
                  <RotateCcw className="w-6 h-6 mx-auto mb-2 text-gold-500" />
                  <p className="text-xs text-charcoal-600">Kolay İade</p>
                </div>
              </div>

              {/* SKU */}
              {product.sku && (
                <p className="text-sm text-charcoal-400 mt-4">
                  SKU: {selectedVariant?.sku || product.sku}
                </p>
              )}
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="mt-12">
            <div className="border-b border-charcoal-200">
              <div className="flex space-x-8">
                {[
                  { id: 'description', label: 'Açıklama' },
                  { id: 'details', label: 'Detaylar' },
                  { id: 'shipping', label: 'Kargo & İade' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'pb-4 font-medium transition-colors relative',
                      activeTab === tab.id
                        ? 'text-gold-500'
                        : 'text-charcoal-500 hover:text-charcoal-700'
                    )}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-400"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-8">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  ) : (
                    <p className="text-charcoal-500">Açıklama bulunmuyor.</p>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-4">
                  {product.attributes && Object.keys(product.attributes).length > 0 ? (
                    Object.entries(product.attributes).map(([key, value]) => (
                      <div key={key} className="flex border-b border-charcoal-100 pb-4">
                        <span className="w-1/3 font-medium text-charcoal-700">{key}</span>
                        <span className="text-charcoal-600">{value}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-charcoal-500">Detay bilgisi bulunmuyor.</p>
                  )}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-charcoal-700 mb-2">Kargo Bilgileri</h4>
                    <ul className="space-y-2 text-charcoal-600">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        500₺ üzeri siparişlerde ücretsiz kargo
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        1-3 iş günü içinde kargoya teslim
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Türkiye geneli teslimat
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-charcoal-700 mb-2">İade Koşulları</h4>
                    <ul className="space-y-2 text-charcoal-600">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        14 gün içinde ücretsiz iade
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Orijinal ambalajında iade
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
