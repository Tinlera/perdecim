import { create } from 'zustand'
import { cartAPI } from '../services/api'
import toast from 'react-hot-toast'

const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  itemCount: 0,
  isLoading: false,
  isOpen: false,

  // Fetch cart
  fetchCart: async () => {
    set({ isLoading: true })
    try {
      const response = await cartAPI.get()
      const { items, subtotal, itemCount } = response.data.data
      set({ items, subtotal, itemCount, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
    }
  },

  // Add to cart
  addToCart: async (productId, variantId = null, quantity = 1) => {
    set({ isLoading: true })
    try {
      const response = await cartAPI.add({ productId, variantId, quantity })
      
      // Save session ID for guest users
      if (response.data.data?.sessionId) {
        localStorage.setItem('sessionId', response.data.data.sessionId)
      }

      await get().fetchCart()
      toast.success('Ürün sepete eklendi')
      set({ isOpen: true })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sepete eklenemedi')
      set({ isLoading: false })
    }
  },

  // Update cart item
  updateCartItem: async (itemId, quantity) => {
    set({ isLoading: true })
    try {
      await cartAPI.update(itemId, { quantity })
      await get().fetchCart()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Güncellenemedi')
      set({ isLoading: false })
    }
  },

  // Remove from cart
  removeFromCart: async (itemId) => {
    set({ isLoading: true })
    try {
      await cartAPI.remove(itemId)
      await get().fetchCart()
      toast.success('Ürün sepetten kaldırıldı')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kaldırılamadı')
      set({ isLoading: false })
    }
  },

  // Clear cart
  clearCart: async () => {
    set({ isLoading: true })
    try {
      await cartAPI.clear()
      set({ items: [], subtotal: 0, itemCount: 0, isLoading: false })
      toast.success('Sepet temizlendi')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Temizlenemedi')
      set({ isLoading: false })
    }
  },

  // Toggle cart drawer
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  // Reset cart (for logout)
  resetCart: () => set({ items: [], subtotal: 0, itemCount: 0 }),
}))

export default useCartStore
