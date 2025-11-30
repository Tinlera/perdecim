import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
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
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { adminAPI } from '../../services/api'
import { formatPrice } from '../../lib/utils'
import { cn } from '../../lib/utils'

// Admin sub-pages (simplified versions - would be full pages in production)
const AdminOverview = () => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

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
    { label: 'Bugünkü Sipariş', value: stats?.todayOrders || 0, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Bugünkü Gelir', value: formatPrice(stats?.todayRevenue || 0), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Aylık Sipariş', value: stats?.monthlyOrders || 0, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Aylık Gelir', value: formatPrice(stats?.monthlyRevenue || 0), icon: DollarSign, color: 'bg-gold-500' },
    { label: 'Toplam Müşteri', value: stats?.totalUsers || 0, icon: Users, color: 'bg-indigo-500' },
    { label: 'Toplam Ürün', value: stats?.totalProducts || 0, icon: Package, color: 'bg-pink-500' },
    { label: 'Düşük Stok', value: stats?.lowStockProducts || 0, icon: AlertTriangle, color: 'bg-orange-500' },
    { label: 'Bekleyen Sipariş', value: stats?.pendingOrders || 0, icon: ShoppingBag, color: 'bg-red-500' },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-12 bg-charcoal-200 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-charcoal-500 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-charcoal-700 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const AdminProducts = () => (
  <div className="bg-white rounded-xl p-6">
    <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Ürün Yönetimi</h1>
    <p className="text-charcoal-500">Ürün listesi ve yönetim araçları burada olacak.</p>
  </div>
)

const AdminCategories = () => (
  <div className="bg-white rounded-xl p-6">
    <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Kategori Yönetimi</h1>
    <p className="text-charcoal-500">Kategori listesi ve yönetim araçları burada olacak.</p>
  </div>
)

const AdminOrders = () => (
  <div className="bg-white rounded-xl p-6">
    <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Sipariş Yönetimi</h1>
    <p className="text-charcoal-500">Sipariş listesi ve yönetim araçları burada olacak.</p>
  </div>
)

const AdminUsers = () => (
  <div className="bg-white rounded-xl p-6">
    <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Kullanıcı Yönetimi</h1>
    <p className="text-charcoal-500">Kullanıcı listesi ve rol yönetimi burada olacak.</p>
  </div>
)

const AdminCoupons = () => (
  <div className="bg-white rounded-xl p-6">
    <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Kupon Yönetimi</h1>
    <p className="text-charcoal-500">Kupon listesi ve yönetim araçları burada olacak.</p>
  </div>
)

const AdminBanners = () => (
  <div className="bg-white rounded-xl p-6">
    <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Banner/Slider Yönetimi</h1>
    <p className="text-charcoal-500">Banner listesi ve yönetim araçları burada olacak.</p>
  </div>
)

const AdminPages = () => (
  <div className="bg-white rounded-xl p-6">
    <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Sayfa Yönetimi</h1>
    <p className="text-charcoal-500">Hakkımızda, İletişim vb. sayfaların yönetimi burada olacak.</p>
  </div>
)

const AdminSettings = () => (
  <div className="bg-white rounded-xl p-6">
    <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Site Ayarları</h1>
    <p className="text-charcoal-500">Genel site ayarları, animasyon kontrolü vb. burada olacak.</p>
  </div>
)

const menuItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/products', label: 'Ürünler', icon: Package },
  { path: '/admin/categories', label: 'Kategoriler', icon: FolderTree },
  { path: '/admin/orders', label: 'Siparişler', icon: ShoppingCart },
  { path: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { path: '/admin/coupons', label: 'Kuponlar', icon: Tag },
  { path: '/admin/banners', label: 'Bannerlar', icon: Image },
  { path: '/admin/pages', label: 'Sayfalar', icon: FileText },
  { path: '/admin/settings', label: 'Ayarlar', icon: Settings },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - Perdecim</title>
      </Helmet>

      <div className="min-h-screen bg-charcoal-50 flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-charcoal-800 transform transition-transform lg:translate-x-0 lg:static',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-charcoal-700">
              <span className="font-display text-2xl text-gold-400 font-bold">
                Perdecim
              </span>
              <p className="text-charcoal-400 text-sm mt-1">Admin Panel</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                      isActive
                        ? 'bg-gold-500 text-white'
                        : 'text-charcoal-300 hover:bg-charcoal-700'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-charcoal-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {user?.firstName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{user?.firstName}</p>
                  <p className="text-charcoal-400 text-sm">Yönetici</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-charcoal-400 hover:text-white w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="bg-white border-b border-charcoal-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-4">
                <a href="/" target="_blank" className="text-charcoal-500 hover:text-gold-500 text-sm">
                  Siteyi Görüntüle →
                </a>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="products/*" element={<AdminProducts />} />
              <Route path="categories/*" element={<AdminCategories />} />
              <Route path="orders/*" element={<AdminOrders />} />
              <Route path="users/*" element={<AdminUsers />} />
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
