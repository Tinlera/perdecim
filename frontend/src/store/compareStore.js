import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'react-hot-toast'

const useCompareStore = create(
  persist(
    (set, get) => ({
      compareItems: [],
      maxItems: 4,

      addToCompare: (product) => {
        const { compareItems, maxItems } = get()
        
        // Check if already in compare
        if (compareItems.find((item) => item.id === product.id)) {
          toast.error('Bu ürün zaten karşılaştırma listesinde')
          return false
        }

        // Check max limit
        if (compareItems.length >= maxItems) {
          toast.error(`En fazla ${maxItems} ürün karşılaştırabilirsiniz`)
          return false
        }

        set({ compareItems: [...compareItems, product] })
        toast.success('Ürün karşılaştırma listesine eklendi')
        return true
      },

      removeFromCompare: (productId) => {
        const { compareItems } = get()
        set({ compareItems: compareItems.filter((item) => item.id !== productId) })
        toast.success('Ürün karşılaştırma listesinden çıkarıldı')
      },

      clearCompare: () => {
        set({ compareItems: [] })
      },

      isInCompare: (productId) => {
        const { compareItems } = get()
        return compareItems.some((item) => item.id === productId)
      },
    }),
    {
      name: 'compare-storage',
    }
  )
)

export default useCompareStore

