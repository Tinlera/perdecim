import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, ChevronDown, Info } from 'lucide-react'

export default function InstallmentTable({ price, className = '' }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Taksit seçenekleri
  const installmentOptions = [
    { months: 2, interestRate: 0 },
    { months: 3, interestRate: 0 },
    { months: 4, interestRate: 1.49 },
    { months: 5, interestRate: 1.79 },
    { months: 6, interestRate: 1.99 },
    { months: 9, interestRate: 2.29 },
    { months: 12, interestRate: 2.49 },
  ]

  const banks = [
    { name: 'Garanti BBVA', logo: '🏦', color: 'bg-green-50' },
    { name: 'İş Bankası', logo: '🏦', color: 'bg-blue-50' },
    { name: 'Yapı Kredi', logo: '🏦', color: 'bg-indigo-50' },
    { name: 'Akbank', logo: '🏦', color: 'bg-red-50' },
  ]

  const calculateInstallment = (months, interestRate) => {
    if (interestRate === 0) {
      return price / months
    }
    const totalPrice = price * (1 + (interestRate * months) / 100)
    return totalPrice / months
  }

  const formatPrice = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
    }).format(value)
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-100 overflow-hidden ${className}`}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-800">Taksit Seçenekleri</p>
            <p className="text-sm text-gray-500">
              12 taksit imkanı - {formatPrice(calculateInstallment(12, 2.49))} x 12
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              {/* Info */}
              <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 text-sm">
                <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-amber-800">
                  Kredi kartınıza göre taksit seçenekleri değişiklik gösterebilir.
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Taksit</th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-700">Aylık</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-700">Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Tek Çekim */}
                    <tr className="border-b border-gray-100 bg-green-50">
                      <td className="px-3 py-3 font-medium text-gray-800">
                        <span className="flex items-center gap-2">
                          Tek Çekim
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                            Önerilen
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-gray-600">{formatPrice(price)}</td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-800">
                        {formatPrice(price)}
                      </td>
                    </tr>

                    {/* Taksitler */}
                    {installmentOptions.map((option) => {
                      const monthly = calculateInstallment(option.months, option.interestRate)
                      const total = monthly * option.months
                      const isInterestFree = option.interestRate === 0

                      return (
                        <tr
                          key={option.months}
                          className={`border-b border-gray-100 ${isInterestFree ? 'bg-blue-50/50' : ''}`}
                        >
                          <td className="px-3 py-3 font-medium text-gray-800">
                            <span className="flex items-center gap-2">
                              {option.months} Taksit
                              {isInterestFree && (
                                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                  %0 Faiz
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center text-gray-600">
                            {formatPrice(monthly)}
                          </td>
                          <td className="px-3 py-3 text-right font-semibold text-gray-800">
                            {formatPrice(total)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Banks */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Geçerli Bankalar:</p>
                <div className="flex flex-wrap gap-2">
                  {banks.map((bank) => (
                    <div
                      key={bank.name}
                      className={`${bank.color} px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700`}
                    >
                      {bank.name}
                    </div>
                  ))}
                  <div className="bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500">
                    +4 diğer
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

