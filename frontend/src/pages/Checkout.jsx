import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import {
  ChevronRight,
  MapPin,
  CreditCard,
  Check,
  Plus,
  Loader2,
  ShoppingBag,
  Tag,
} from 'lucide-react'
import useCartStore from '../store/cartStore'
import useAuthStore from '../store/authStore'
import { usersAPI, ordersAPI, adminAPI, paymentAPI } from '../services/api'
import { formatPrice, cn } from '../lib/utils'
import toast from 'react-hot-toast'

const steps = [
  { id: 'address', title: 'Adres', icon: MapPin },
  { id: 'payment', title: 'Ödeme', icon: CreditCard },
  { id: 'confirm', title: 'Onay', icon: Check },
]

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, itemCount, fetchCart } = useCartStore()
  const { isAuthenticated, user } = useAuthStore()

  const [currentStep, setCurrentStep] = useState(0)
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discount, setDiscount] = useState(0)

  const shippingCost = subtotal >= 500 ? 0 : 29.90
  const total = subtotal - discount + shippingCost

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } })
      return
    }

    if (itemCount === 0) {
      navigate('/cart')
      return
    }

    fetchAddresses()
  }, [isAuthenticated, itemCount, navigate])

  const fetchAddresses = async () => {
    try {
      const response = await usersAPI.getAddresses()
      setAddresses(response.data.data)
      const defaultAddr = response.data.data.find((a) => a.isDefault)
      if (defaultAddr) setSelectedAddress(defaultAddr)
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
    }
  }

  const handleAddAddress = async (data) => {
    setIsLoading(true)
    try {
      await usersAPI.addAddress(data)
      await fetchAddresses()
      setShowAddressForm(false)
      reset()
      toast.success('Adres eklendi')
    } catch (error) {
      toast.error('Adres eklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    try {
      const response = await adminAPI.validateCoupon({
        code: couponCode,
        subtotal,
      })
      setAppliedCoupon(response.data.data)
      setDiscount(response.data.data.calculatedDiscount)
      toast.success('Kupon uygulandı')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Geçersiz kupon')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode('')
  }

  const handleCreateOrder = async () => {
    if (!selectedAddress) {
      toast.error('Lütfen bir adres seçin')
      return
    }

    setIsLoading(true)
    try {
      const orderData = {
        shippingAddress: selectedAddress,
        billingAddress: selectedAddress,
        couponCode: appliedCoupon?.code,
        paymentMethod: 'credit_card',
      }

      const response = await ordersAPI.create(orderData)
      const order = response.data.data

      // Test modunda direkt ödeme simülasyonu
      if (import.meta.env.DEV) {
        await paymentAPI.testPayment({ orderId: order.id })
        toast.success('Sipariş oluşturuldu!')
        await fetchCart()
        navigate(`/account/orders/${order.id}`)
      } else {
        // Gerçek ödeme için İyzico'ya yönlendir
        navigate(`/payment/${order.id}`)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sipariş oluşturulamadı')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 0 && !selectedAddress) {
      toast.error('Lütfen bir adres seçin')
      return
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  if (!isAuthenticated || itemCount === 0) {
    return null
  }

  return (
    <>
      <Helmet>
        <title>Ödeme - Perdecim</title>
      </Helmet>

      <div className="min-h-screen bg-charcoal-50 py-8">
        <div className="container-custom">
          {/* Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                      index <= currentStep
                        ? 'bg-gold-400 text-white'
                        : 'bg-charcoal-200 text-charcoal-500'
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'ml-2 font-medium hidden sm:block',
                      index <= currentStep ? 'text-charcoal-700' : 'text-charcoal-400'
                    )}
                  >
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 mx-4 text-charcoal-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl p-6"
              >
                {/* Step 1: Address */}
                {currentStep === 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-charcoal-700 mb-6">
                      Teslimat Adresi
                    </h2>

                    {addresses.length > 0 ? (
                      <div className="space-y-4 mb-6">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            onClick={() => setSelectedAddress(address)}
                            className={cn(
                              'p-4 border-2 rounded-xl cursor-pointer transition-all',
                              selectedAddress?.id === address.id
                                ? 'border-gold-400 bg-gold-50'
                                : 'border-charcoal-200 hover:border-gold-400'
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-charcoal-700">
                                  {address.title}
                                </p>
                                <p className="text-charcoal-600 mt-1">
                                  {address.firstName} {address.lastName}
                                </p>
                                <p className="text-charcoal-500 text-sm mt-1">
                                  {address.addressLine}
                                </p>
                                <p className="text-charcoal-500 text-sm">
                                  {address.district}, {address.city}
                                </p>
                                <p className="text-charcoal-500 text-sm">
                                  {address.phone}
                                </p>
                              </div>
                              {selectedAddress?.id === address.id && (
                                <div className="w-6 h-6 bg-gold-400 rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-charcoal-500 mb-6">
                        Kayıtlı adresiniz bulunmuyor.
                      </p>
                    )}

                    {/* Add Address Form */}
                    {showAddressForm ? (
                      <form onSubmit={handleSubmit(handleAddAddress)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label">Adres Başlığı</label>
                            <input
                              {...register('title', { required: true })}
                              placeholder="Ev, İş vb."
                              className="input"
                            />
                          </div>
                          <div>
                            <label className="label">Telefon</label>
                            <input
                              {...register('phone', { required: true })}
                              placeholder="05XX XXX XX XX"
                              className="input"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label">Ad</label>
                            <input
                              {...register('firstName', { required: true })}
                              className="input"
                            />
                          </div>
                          <div>
                            <label className="label">Soyad</label>
                            <input
                              {...register('lastName', { required: true })}
                              className="input"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label">İl</label>
                            <input
                              {...register('city', { required: true })}
                              className="input"
                            />
                          </div>
                          <div>
                            <label className="label">İlçe</label>
                            <input
                              {...register('district', { required: true })}
                              className="input"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="label">Adres</label>
                          <textarea
                            {...register('addressLine', { required: true })}
                            rows={3}
                            className="input"
                            placeholder="Mahalle, sokak, bina no, daire no..."
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="btn-outline"
                          >
                            İptal
                          </button>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary"
                          >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kaydet'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="flex items-center text-gold-500 hover:text-gold-600"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Yeni Adres Ekle
                      </button>
                    )}
                  </div>
                )}

                {/* Step 2: Payment */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-xl font-semibold text-charcoal-700 mb-6">
                      Ödeme Bilgileri
                    </h2>
                    <div className="bg-charcoal-50 rounded-xl p-6 text-center">
                      <CreditCard className="w-12 h-12 text-gold-400 mx-auto mb-4" />
                      <p className="text-charcoal-600 mb-2">
                        Güvenli ödeme İyzico altyapısı ile gerçekleştirilecektir.
                      </p>
                      <p className="text-charcoal-500 text-sm">
                        Siparişi onayladığınızda ödeme sayfasına yönlendirileceksiniz.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirm */}
                {currentStep === 2 && (
                  <div>
                    <h2 className="text-xl font-semibold text-charcoal-700 mb-6">
                      Sipariş Özeti
                    </h2>

                    {/* Address Summary */}
                    <div className="mb-6">
                      <h3 className="font-medium text-charcoal-700 mb-2">Teslimat Adresi</h3>
                      <div className="bg-charcoal-50 rounded-lg p-4">
                        <p className="font-medium">{selectedAddress?.title}</p>
                        <p className="text-charcoal-600">
                          {selectedAddress?.firstName} {selectedAddress?.lastName}
                        </p>
                        <p className="text-charcoal-500 text-sm">
                          {selectedAddress?.addressLine}
                        </p>
                        <p className="text-charcoal-500 text-sm">
                          {selectedAddress?.district}, {selectedAddress?.city}
                        </p>
                      </div>
                    </div>

                    {/* Items Summary */}
                    <div>
                      <h3 className="font-medium text-charcoal-700 mb-2">Ürünler</h3>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-4 bg-charcoal-50 rounded-lg p-3"
                          >
                            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden">
                              {item.product?.featuredImage ? (
                                <img
                                  src={item.product.featuredImage}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag className="w-6 h-6 text-charcoal-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-charcoal-700">
                                {item.product?.name}
                              </p>
                              <p className="text-charcoal-500 text-sm">
                                {item.quantity} adet × {formatPrice(item.price)}
                              </p>
                            </div>
                            <p className="font-medium text-charcoal-700">
                              {formatPrice(item.total)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-8 pt-6 border-t border-charcoal-100">
                  {currentStep > 0 ? (
                    <button onClick={prevStep} className="btn-outline">
                      Geri
                    </button>
                  ) : (
                    <Link to="/cart" className="btn-outline">
                      Sepete Dön
                    </Link>
                  )}
                  {currentStep < steps.length - 1 ? (
                    <button onClick={nextStep} className="btn-primary">
                      Devam Et
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateOrder}
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Siparişi Onayla'
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 sticky top-24">
                <h3 className="font-semibold text-charcoal-700 mb-4">Sipariş Özeti</h3>

                {/* Coupon */}
                <div className="mb-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-green-700 font-medium">
                          {appliedCoupon.code}
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-green-600 hover:text-green-700 text-sm"
                      >
                        Kaldır
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Kupon kodu"
                        className="input py-2 text-sm flex-1"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="btn-outline py-2 px-4 text-sm"
                      >
                        Uygula
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Ara Toplam</span>
                    <span className="text-charcoal-700">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>İndirim</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Kargo</span>
                    <span className="text-charcoal-700">
                      {shippingCost === 0 ? 'Ücretsiz' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  <div className="border-t border-charcoal-100 pt-3 flex justify-between">
                    <span className="font-semibold text-charcoal-700">Toplam</span>
                    <span className="font-bold text-xl text-gold-500">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
