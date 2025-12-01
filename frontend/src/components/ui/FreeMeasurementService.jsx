import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ruler, Check, Loader2, X, MapPin, Phone, User, Calendar, Clock, Home } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function FreeMeasurementService({ isOpen, onClose }) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    preferredDate: '',
    preferredTime: '',
    propertyType: 'apartment',
    roomCount: '1',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSuccess(true)
    toast.success('Ölçü randevunuz alındı! En kısa sürede sizinle iletişime geçeceğiz.')

    setTimeout(() => {
      onClose()
      setIsSuccess(false)
      setStep(1)
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        district: '',
        preferredDate: '',
        preferredTime: '',
        propertyType: 'apartment',
        roomCount: '1',
        notes: '',
      })
    }, 2000)
  }

  const timeSlots = [
    { id: 'morning', label: '09:00 - 12:00', icon: '🌅' },
    { id: 'afternoon', label: '12:00 - 17:00', icon: '☀️' },
    { id: 'evening', label: '17:00 - 20:00', icon: '🌆' },
  ]

  const propertyTypes = [
    { id: 'apartment', label: 'Daire', icon: '🏢' },
    { id: 'house', label: 'Müstakil Ev', icon: '🏠' },
    { id: 'office', label: 'Ofis', icon: '🏬' },
    { id: 'villa', label: 'Villa', icon: '🏡' },
  ]

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-xl sm:w-full bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-5 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Ruler className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Ücretsiz Ölçü Hizmeti</h3>
                  <p className="text-white/80 text-sm">Uzman ekibimiz evinize gelsin</p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            {!isSuccess && (
              <div className="px-5 pt-4">
                <div className="flex items-center justify-between">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                          step >= s
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {step > s ? <Check className="w-5 h-5" /> : s}
                      </div>
                      {s < 2 && (
                        <div
                          className={`flex-1 h-1 mx-2 rounded ${
                            step > s ? 'bg-amber-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Kişisel Bilgiler</span>
                  <span>Randevu Detayları</span>
                </div>
              </div>
            )}

            {/* Success State */}
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-8 text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">Randevunuz Alındı!</h4>
                  <p className="text-gray-600">
                    Uzman ekibimiz en kısa sürede sizinle iletişime geçecektir.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4"
                      >
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            <User className="w-4 h-4 inline mr-1" />
                            Ad Soyad *
                          </label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                            placeholder="Adınız Soyadınız"
                          />
                        </div>

                        {/* Phone & Email */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              <Phone className="w-4 h-4 inline mr-1" />
                              Telefon *
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                              placeholder="05XX XXX XX XX"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              E-posta
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                              placeholder="ornek@email.com"
                            />
                          </div>
                        </div>

                        {/* City & District */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              İl *
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                              placeholder="İstanbul"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              İlçe *
                            </label>
                            <input
                              type="text"
                              name="district"
                              value={formData.district}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                              placeholder="Kadıköy"
                            />
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Adres *
                          </label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            rows={2}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none resize-none"
                            placeholder="Mahalle, Sokak, Bina No, Daire No"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                        >
                          Devam Et
                        </button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        {/* Property Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Home className="w-4 h-4 inline mr-1" />
                            Mülk Tipi
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {propertyTypes.map((type) => (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, propertyType: type.id })}
                                className={`py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                                  formData.propertyType === type.id
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                <span className="text-lg">{type.icon}</span>
                                <span className="text-xs">{type.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Room Count */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ölçülecek Oda Sayısı
                          </label>
                          <div className="grid grid-cols-5 gap-2">
                            {['1', '2', '3', '4', '5+'].map((count) => (
                              <button
                                key={count}
                                type="button"
                                onClick={() => setFormData({ ...formData, roomCount: count })}
                                className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                                  formData.roomCount === count
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {count}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Tercih Edilen Tarih *
                          </label>
                          <input
                            type="date"
                            name="preferredDate"
                            value={formData.preferredDate}
                            onChange={handleChange}
                            min={getMinDate()}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                          />
                        </div>

                        {/* Time Slot */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Tercih Edilen Saat Aralığı *
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, preferredTime: slot.id })}
                                className={`py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                                  formData.preferredTime === slot.id
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                <span>{slot.icon}</span>
                                <span className="text-xs">{slot.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Ek Notlar
                          </label>
                          <input
                            type="text"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                            placeholder="Özel istekleriniz varsa belirtiniz"
                          />
                        </div>

                        {/* Info */}
                        <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-800">
                          <p>✨ Ölçü hizmeti tamamen <strong>ücretsizdir</strong>.</p>
                          <p>📏 Profesyonel ekibimiz tüm ölçüleri alır.</p>
                          <p>🎨 Kumaş ve model önerileri sunar.</p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            Geri
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || !formData.preferredDate || !formData.preferredTime}
                            className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Gönderiliyor...
                              </>
                            ) : (
                              <>
                                <Ruler className="w-5 h-5" />
                                Randevu Oluştur
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

