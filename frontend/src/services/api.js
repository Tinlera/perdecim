import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor - token ekleme
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Session ID for guest cart
    const sessionId = localStorage.getItem('sessionId')
    if (sessionId) {
      config.headers['X-Session-Id'] = sessionId
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - token yenileme
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Token expired
    if (error.response?.status === 401 && 
        error.response?.data?.code === 'TOKEN_EXPIRED' && 
        !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data.data
        
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  setup2FA: () => api.post('/auth/2fa/setup'),
  verify2FA: (data) => api.post('/auth/2fa/verify', data),
  disable2FA: (data) => api.post('/auth/2fa/disable', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
}

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  // Admin
  getAllAdmin: (params) => api.get('/products/admin/all', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  deleteImage: (id, imageIndex) => api.delete(`/products/${id}/images/${imageIndex}`),
  addVariant: (id, data) => api.post(`/products/${id}/variants`, data),
  updateVariant: (id, variantId, data) => api.put(`/products/${id}/variants/${variantId}`, data),
  deleteVariant: (id, variantId) => api.delete(`/products/${id}/variants/${variantId}`),
}

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
  // Admin
  getAllAdmin: () => api.get('/categories/admin/all'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
  updateOrder: (categories) => api.put('/categories/admin/order', { categories }),
}

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (itemId, data) => api.put(`/cart/items/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart/clear'),
  merge: () => api.post('/cart/merge'),
}

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  // Admin/Staff
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getStats: (params) => api.get('/orders/stats/overview', { params }),
}

// Payment API
export const paymentAPI = {
  initialize: (data) => api.post('/payment/initialize', data),
  checkStatus: (orderId) => api.get(`/payment/status/${orderId}`),
  testPayment: (data) => api.post('/payment/test', data),
  refund: (data) => api.post('/payment/refund', data),
}

// Users API
export const usersAPI = {
  // Favorites
  getFavorites: () => api.get('/users/favorites'),
  addFavorite: (productId) => api.post('/users/favorites', { productId }),
  removeFavorite: (productId) => api.delete(`/users/favorites/${productId}`),
  // Addresses
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  // Admin
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  changeRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  getStaff: () => api.get('/users/staff'),
}

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  // Banners
  getBanners: (params) => api.get('/admin/banners', { params }),
  getActiveBanners: () => api.get('/admin/banners/active'),
  createBanner: (data) => api.post('/admin/banners', data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
  // Pages
  getPages: () => api.get('/admin/pages'),
  getPage: (slug) => api.get(`/admin/pages/${slug}`),
  createPage: (data) => api.post('/admin/pages', data),
  updatePage: (id, data) => api.put(`/admin/pages/${id}`, data),
  deletePage: (id) => api.delete(`/admin/pages/${id}`),
  // Settings
  getSettings: (group) => api.get('/admin/settings', { params: { group } }),
  updateSettings: (data) => api.put('/admin/settings', data),
  // Coupons
  getCoupons: () => api.get('/admin/coupons'),
  createCoupon: (data) => api.post('/admin/coupons', data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  validateCoupon: (data) => api.post('/admin/coupons/validate', data),
  // Stock logs
  getStockLogs: (params) => api.get('/admin/stock-logs', { params }),
  approveStockLog: (id, status) => api.put(`/admin/stock-logs/${id}/approve`, { status }),
  // Sales logs
  getSalesLogs: (params) => api.get('/admin/sales-logs', { params }),
}

export default api
