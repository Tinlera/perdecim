import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI, cartAPI } from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      require2FA: false,
      tempToken: null,

      // Initialize auth state
      initialize: async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          set({ isLoading: false, isAuthenticated: false, user: null })
          return
        }

        try {
          const response = await authAPI.me()
          set({
            user: response.data.data,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          set({ isLoading: false, isAuthenticated: false, user: null })
        }
      },

      // Login
      login: async (email, password) => {
        const response = await authAPI.login({ email, password })
        const { data } = response.data

        if (data.require2FA) {
          set({ require2FA: true, tempToken: data.tempToken })
          return { require2FA: true }
        }

        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        set({
          user: data.user,
          isAuthenticated: true,
          require2FA: false,
          tempToken: null,
        })

        // Merge guest cart
        try {
          await cartAPI.merge()
        } catch (e) {
          // Ignore merge errors
        }

        return { user: data.user, redirectPath: data.redirectPath }
      },

      // Verify 2FA
      verify2FA: async (token) => {
        const { tempToken } = get()
        const response = await authAPI.verify2FA({ token, tempToken })
        const { data } = response.data

        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        set({
          user: data.user,
          isAuthenticated: true,
          require2FA: false,
          tempToken: null,
        })

        // Merge guest cart
        try {
          await cartAPI.merge()
        } catch (e) {
          // Ignore merge errors
        }

        return { user: data.user, redirectPath: data.redirectPath }
      },

      // Register
      register: async (data) => {
        const response = await authAPI.register(data)
        const { user, accessToken, refreshToken } = response.data.data

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        set({
          user,
          isAuthenticated: true,
        })

        // Merge guest cart
        try {
          await cartAPI.merge()
        } catch (e) {
          // Ignore merge errors
        }

        return user
      },

      // Logout
      logout: async () => {
        try {
          await authAPI.logout()
        } catch (e) {
          // Ignore logout errors
        }

        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')

        set({
          user: null,
          isAuthenticated: false,
          require2FA: false,
          tempToken: null,
        })
      },

      // Update profile
      updateProfile: async (data) => {
        const response = await authAPI.updateProfile(data)
        set({ user: response.data.data })
        return response.data.data
      },

      // Change password
      changePassword: async (currentPassword, newPassword) => {
        await authAPI.changePassword({ currentPassword, newPassword })
      },

      // Setup 2FA
      setup2FA: async () => {
        const response = await authAPI.setup2FA()
        return response.data.data
      },

      // Disable 2FA
      disable2FA: async (token, password) => {
        await authAPI.disable2FA({ token, password })
        set((state) => ({
          user: { ...state.user, twoFactorEnabled: false },
        }))
      },

      // Enable 2FA (after verification)
      enable2FA: () => {
        set((state) => ({
          user: { ...state.user, twoFactorEnabled: true },
        }))
      },

      // Cancel 2FA flow
      cancel2FA: () => {
        set({ require2FA: false, tempToken: null })
      },

      // Set auth directly (for Google OAuth etc.)
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        set({
          user,
          isAuthenticated: true,
          require2FA: false,
          tempToken: null,
        })
      },

      // Check if user has role
      hasRole: (roles) => {
        const { user } = get()
        if (!user) return false
        if (typeof roles === 'string') return user.role === roles
        return roles.includes(user.role)
      },

      // Check if user is admin
      isAdmin: () => get().user?.role === 'admin',

      // Check if user is manager or admin
      isManagerOrAdmin: () => ['admin', 'manager'].includes(get().user?.role),

      // Check if user is staff or above
      isStaffOrAbove: () => ['admin', 'manager', 'staff'].includes(get().user?.role),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
