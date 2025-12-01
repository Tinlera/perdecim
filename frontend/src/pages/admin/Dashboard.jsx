import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  ShoppingCart,
  Tag,
  Image,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  ChevronDown,
  Search,
  Moon,
  Sun,
  Activity,
  MessageSquare,
  Mail,
  Shield,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { adminAPI } from '../../services/api'
import { formatPrice, cn } from '../../lib/utils'

// Import admin sub-pages
import AdminProducts from './Products'
import AdminCategories from './Categories'
import AdminOrders from './Orders'
import AdminUsers from './Users'
import AdminCoupons from './Coupons'
import AdminBanners from './Banners'
import AdminPages from './Pages'
import AdminSettings from './Settings'
import AdminApprovals from './Approvals'
import AdminRemovedProducts from './RemovedProducts'

// Dashboard Overview Component
const AdminOverview = () => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getDashboard()
        setStats(response.data.data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Bugünkü Sipariş', value: stats?.todayOrders || 0, icon: ShoppingCart, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Bugünkü Gelir', value: formatPrice(stats?.todayRevenue || 0), icon: DollarSign, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50' },
    { label: 'Aylık Sipariş', value: stats?.monthlyOrders || 0, icon: TrendingUp, color: 'from-violet-500 to-violet-600', bgColor: 'bg-violet-50' },
    { label: 'Aylık Gelir', value: formatPrice(stats?.monthlyRevenue || 0), icon: DollarSign, color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50' },
    { label: 'Toplam Müşteri', value: stats?.totalUsers || 0, icon: Users, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50' },
    { label: 'Toplam Ürün', value: stats?.totalProducts || 0, icon: Package, color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-50' },
    { label: 'Düşük Stok', value: stats?.lowStockProducts || 0, icon: AlertTriangle, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Bekleyen Sipariş', value: stats?.pendingOrders || 0, icon: Clock, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50' },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 animate-pulse border border-gray-100">
            <div className="h-16 bg-gray-200 rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Hoş geldiniz, işletmenizin genel durumunu görüntüleyin</p>
      </div>

      {/* Alert for pending approvals */}
      {stats?.pendingApprovals > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">{stats.pendingApprovals} onay bekleyen işlem var</p>
              <p className="text-sm text-amber-600">Personel talepleri onayınızı bekliyor</p>
            </div>
          </div>
          <NavLink
            to="/admin/approvals"
            className="px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            İncele
          </NavLink>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`${stat.bgColor} rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-2 gap-3">
            <NavLink
              to="/admin/products"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">Ürün Ekle</span>
            </NavLink>
            <NavLink
              to="/admin/orders"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">Siparişler</span>
            </NavLink>
            <NavLink
              to="/admin/coupons"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              <Tag className="w-5 h-5" />
              <span className="font-medium">Kupon Oluştur</span>
            </NavLink>
            <NavLink
              to="/admin/settings"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Ayarlar</span>
            </NavLink>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistem Durumu</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-gray-700">Veritabanı</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Aktif</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-gray-700">Ödeme Sistemi</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Aktif</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-gray-700">Email Servisi</span>
              </div>
              <span className="text-green-600 text-sm font-medium">Aktif</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/products', label: 'Ürünler', icon: Package },
  { path: '/admin/removed-products', label: 'Satıştan Kalkanlar', icon: EyeOff },
  { path: '/admin/categories', label: 'Kategoriler', icon: FolderTree },
  { path: '/admin/orders', label: 'Siparişler', icon: ShoppingCart },
  { path: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { path: '/admin/approvals', label: 'Onay Bekleyenler', icon: CheckCircle, badge: true },
  { path: '/admin/coupons', label: 'Kuponlar', icon: Tag },
  { path: '/admin/banners', label: 'Bannerlar', icon: Image },
  { path: '/admin/pages', label: 'Sayfalar', icon: FileText },
  { divider: true },
  { path: '/admin/settings', label: 'Ayarlar', icon: Settings },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    fetchPendingCount()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await adminAPI.getNotifications({ limit: 5 })
      setNotifications(response.data.data)
      setUnreadCount(response.data.unreadCount)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const fetchPendingCount = async () => {
    try {
      const response = await adminAPI.getPendingApprovals({ status: 'pending' })
      setPendingCount(response.data.pagination?.total || 0)
    } catch (error) {
      console.error('Failed to fetch pending count:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const markAllRead = async () => {
    try {
      await adminAPI.markAllNotificationsRead()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - Uygunlar Ev Tekstil</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display text-xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                    Uygunlar Ev Tekstil
                  </h1>
                  <p className="text-gray-400 text-sm mt-0.5">Yönetim Paneli</p>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item, index) => 
                item.divider ? (
                  <div key={index} className="my-4 border-t border-gray-100" />
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between px-4 py-3 rounded-xl transition-all',
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                          : 'text-gray-600 hover:bg-gray-100'
                      )
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && pendingCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </NavLink>
                )
              )}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 font-medium truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-gray-400 text-sm truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 text-gray-500 hover:text-red-500 w-full p-3 rounded-xl hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Çıkış Yap</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                {/* Search */}
                <div className="hidden md:flex items-center bg-gray-100 rounded-xl px-4 py-2 w-72">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ara..."
                    className="bg-transparent border-none outline-none ml-3 w-full text-gray-700 placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">Bildirimler</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllRead}
                              className="text-amber-600 text-sm font-medium hover:underline"
                            >
                              Tümünü Okundu İşaretle
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={cn(
                                  'p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors',
                                  !notification.isRead && 'bg-amber-50/50'
                                )}
                              >
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-gray-500">
                              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>Bildirim yok</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Site Link */}
                <a
                  href="/"
                  target="_blank"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span className="font-medium text-sm">Siteyi Görüntüle</span>
                </a>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="products/*" element={<AdminProducts />} />
              <Route path="removed-products" element={<AdminRemovedProducts />} />
              <Route path="categories/*" element={<AdminCategories />} />
              <Route path="orders/*" element={<AdminOrders />} />
              <Route path="users/*" element={<AdminUsers />} />
              <Route path="approvals" element={<AdminApprovals />} />
              <Route path="coupons/*" element={<AdminCoupons />} />
              <Route path="banners/*" element={<AdminBanners />} />
              <Route path="pages/*" element={<AdminPages />} />
              <Route path="settings/*" element={<AdminSettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  )
}
