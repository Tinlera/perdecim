import { create } from 'zustand'

const useUIStore = create((set) => ({
  // Curtain animation
  showCurtain: true,
  curtainAnimationComplete: false,
  
  // Mobile menu
  isMobileMenuOpen: false,
  
  // Search
  isSearchOpen: false,
  searchQuery: '',

  // Actions
  hideCurtain: () => set({ showCurtain: false }),
  setCurtainAnimationComplete: () => set({ curtainAnimationComplete: true }),
  
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  closeSearch: () => set({ isSearchOpen: false }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))

export default useUIStore
