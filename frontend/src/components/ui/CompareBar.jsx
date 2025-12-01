import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { X, GitCompare, Trash2 } from 'lucide-react'
import useCompareStore from '../../store/compareStore'

export default function CompareBar() {
  const navigate = useNavigate()
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore()

  if (compareItems.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-amber-400 shadow-2xl"
      >
        <div className="container-custom py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Products */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 flex-1">
              <div className="flex items-center gap-2 text-gray-600 mr-2">
                <GitCompare className="w-5 h-5 text-amber-500" />
                <span className="font-semibold whitespace-nowrap">Karşılaştır ({compareItems.length}/4)</span>
              </div>
              
              {compareItems.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="relative flex-shrink-0"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={product.featuredImage || product.images?.[0] || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}

              {/* Empty slots */}
              {[...Array(4 - compareItems.length)].map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex-shrink-0 flex items-center justify-center"
                >
                  <span className="text-gray-300 text-2xl">+</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={clearCompare}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Tümünü Temizle"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/compare')}
                disabled={compareItems.length < 2}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <GitCompare className="w-5 h-5" />
                <span className="hidden sm:inline">Karşılaştır</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

