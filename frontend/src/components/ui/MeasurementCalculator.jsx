import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Ruler, Info, Check, AlertCircle } from 'lucide-react'

export default function MeasurementCalculator({ onCalculate, className = '' }) {
  const [windowWidth, setWindowWidth] = useState('')
  const [windowHeight, setWindowHeight] = useState('')
  const [curtainType, setCurtainType] = useState('standard')
  const [pleatStyle, setPleatStyle] = useState('normal')
  const [result, setResult] = useState(null)
  const [showGuide, setShowGuide] = useState(false)

  const curtainTypes = [
    { id: 'standard', label: 'Standart Perde', multiplier: 1.5 },
    { id: 'blackout', label: 'Blackout Perde', multiplier: 1.5 },
    { id: 'sheer', label: 'Tül Perde', multiplier: 2.0 },
    { id: 'store', label: 'Stor Perde', multiplier: 1.0 },
  ]

  const pleatStyles = [
    { id: 'normal', label: 'Normal Pile', multiplier: 1.5 },
    { id: 'dense', label: 'Sık Pile', multiplier: 2.0 },
    { id: 'light', label: 'Seyrek Pile', multiplier: 1.2 },
  ]

  const calculateMeasurement = () => {
    if (!windowWidth || !windowHeight) return

    const width = parseFloat(windowWidth)
    const height = parseFloat(windowHeight)

    const selectedCurtainType = curtainTypes.find(t => t.id === curtainType)
    const selectedPleatStyle = pleatStyles.find(p => p.id === pleatStyle)

    // Kumaş genişliği hesaplama (perde genişliği * pile çarpanı)
    const fabricWidth = Math.ceil(width * selectedPleatStyle.multiplier)
    
    // Kumaş yüksekliği hesaplama (pencere yüksekliği + etek payı + askı payı)
    const hemAllowance = 15 // cm
    const hangingAllowance = 10 // cm
    const fabricHeight = Math.ceil(height + hemAllowance + hangingAllowance)

    // Toplam kumaş alanı (m²)
    const totalArea = (fabricWidth * fabricHeight) / 10000

    // Tahmini fiyat hesaplama (örnek: m² başına 150 TL)
    const pricePerSqm = curtainType === 'blackout' ? 200 : curtainType === 'sheer' ? 120 : 150
    const estimatedPrice = Math.ceil(totalArea * pricePerSqm)

    const calculationResult = {
      fabricWidth,
      fabricHeight,
      totalArea: totalArea.toFixed(2),
      estimatedPrice,
      curtainType: selectedCurtainType.label,
      pleatStyle: selectedPleatStyle.label,
    }

    setResult(calculationResult)
    if (onCalculate) onCalculate(calculationResult)
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Perde Ölçü Hesaplayıcı</h3>
            <p className="text-white/80 text-sm">Pencere ölçülerinize göre perde boyutu hesaplayın</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Measurement Guide Button */}
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium"
        >
          <Info className="w-4 h-4" />
          Ölçü nasıl alınır?
        </button>

        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-amber-50 rounded-xl p-4 text-sm text-gray-700 space-y-2">
                <p className="font-semibold text-amber-800">📏 Ölçü Alma Rehberi:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li><strong>Genişlik:</strong> Pencere kasasının iç genişliğini ölçün</li>
                  <li><strong>Yükseklik:</strong> Korniş/ray hizasından zemine olan mesafeyi ölçün</li>
                  <li>Ölçülerken metal şerit metre kullanın</li>
                  <li>Zemine kadar istemiyorsanız denizlik üstüne 15 cm ekleyin</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ruler className="w-4 h-4 inline mr-1" />
              Genişlik (cm)
            </label>
            <input
              type="number"
              value={windowWidth}
              onChange={(e) => setWindowWidth(e.target.value)}
              placeholder="Örn: 200"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Ruler className="w-4 h-4 inline mr-1 rotate-90" />
              Yükseklik (cm)
            </label>
            <input
              type="number"
              value={windowHeight}
              onChange={(e) => setWindowHeight(e.target.value)}
              placeholder="Örn: 260"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
            />
          </div>
        </div>

        {/* Curtain Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Perde Tipi</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {curtainTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setCurtainType(type.id)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  curtainType === type.id
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pleat Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Pile Yoğunluğu</label>
          <div className="grid grid-cols-3 gap-2">
            {pleatStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setPleatStyle(style.id)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  pleatStyle === style.id
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateMeasurement}
          disabled={!windowWidth || !windowHeight}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <Calculator className="w-5 h-5" />
          Hesapla
        </button>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-amber-800">
                <Check className="w-5 h-5" />
                <h4 className="font-bold">Hesaplama Sonucu</h4>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-500">Kumaş Genişliği</p>
                  <p className="text-xl font-bold text-gray-800">{result.fabricWidth} cm</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-500">Kumaş Yüksekliği</p>
                  <p className="text-xl font-bold text-gray-800">{result.fabricHeight} cm</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-500">Toplam Alan</p>
                  <p className="text-xl font-bold text-gray-800">{result.totalArea} m²</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-gray-500">Tahmini Fiyat</p>
                  <p className="text-xl font-bold text-amber-600">₺{result.estimatedPrice.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white rounded-lg p-3 text-sm">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600">
                  Bu fiyat tahminidir. Kesin fiyat için ürün seçimi yapınız veya bizimle iletişime geçiniz.
                </p>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors">
                  Teklif Al
                </button>
                <button className="flex-1 py-3 border-2 border-amber-600 text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-colors">
                  WhatsApp
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

