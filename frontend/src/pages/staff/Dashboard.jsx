import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FileText,
  LogOut,
  Menu,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { adminAPI, ordersAPI } from '../../services/api'
import { formatPrice, formatDateTime, getOrderStatusText, getOrderStatusColor } from '../../lib/utils'
import { cn } from '../../lib/utils'

// Staff Overview
const StaffOverview = () => {
  const { user } = useAuthStore()
  const [salesLogs, setSalesLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminAPI.getSalesLogs({ limit: 10 })
        setSalesLogs(response.data.data.logs)
      } catch (error) {
        console.error('Failed to fetch sales logs:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal-700 mb-6">
        Hoş Geldiniz, {user?.firstName}!
      </h1>

      <div className="bg-white rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-700 mb-4">Son Aktiviteler</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-charcoal-100 rounded animate-pulse" />
            ))}
          </div>
        ) : salesLogs.length === 0 ? (
          <p className="text-charcoal-500">Henüz aktivite yok.</p>
        ) : (
          <div className="space-y-4">
            {salesLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
                <div>
                  <p className="font-medium text-charcoal-700">
                    Sipariş #{log.order?.orderNumber}
                  </p>
                  <p className="text-charcoal-500 text-sm">{log.action}</p>
                </div>
                <div className="text-right">
                  <p className="text-charcoal-500 text-sm">
                    {formatDateTime(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Staff Orders
const StaffOrders = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.getAll({ limit: 20 })
        setOrders(response.data.data.orders)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [])

  return (
    <div className="bg-white rounded-xl p-6">
      <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Siparişler</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-charcoal-100 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="p-4 border border-charcoal-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-charcoal-700">#{order.orderNumber}</p>
                  <p className="text-charcoal-500 text-sm">
                    {order.user?.firstName} {order.user?.lastName}
                  </p>
                  <p className="text-charcoal-500 text-sm">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-charcoal-700">
                    {formatPrice(order.total)}
                  </p>
                  <span className={`badge ${getOrderStatusColor(order.status)}`}>
                    {getOrderStatusText(order.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Stock Management (Manager only)
const StaffStock = () => {
  const { user } = useAuthStore()
  const [stockLogs, setStockLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStockLogs = async () => {
      try {
        const response = await adminAPI.getStockLogs({ status: 'pending', limit: 20 })
        setStockLogs(response.data.data.logs)
      } catch (error) {
        console.error('Failed to fetch stock logs:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStockLogs()
  }, [])

  if (user?.role === 'staff') {
    return (
      <div className="bg-white rounded-xl p-6 text-center">
        <Package className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
        <p className="text-charcoal-500">Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Stok Yönetimi</h1>
      <p className="text-charcoal-500 mb-4">Onay bekleyen stok hareketleri:</p>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-charcoal-100 rounded animate-pulse" />
          ))}
        </div>
      ) : stockLogs.length === 0 ? (
        <p className="text-charcoal-500">Onay bekleyen stok hareketi yok.</p>
      ) : (
        <div className="space-y-4">
          {stockLogs.map((log) => (
            <div key={log.id} className="p-4 border border-charcoal-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-charcoal-700">{log.product?.name}</p>
                  <p className="text-charcoal-500 text-sm">
                    {log.type === 'out' ? 'Çıkış' : log.type === 'in' ? 'Giriş' : 'Düzeltme'}: {log.quantity} adet
                  </p>
                  <p className="text-charcoal-500 text-sm">{log.reason}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="btn-primary py-2 px-4 text-sm">Onayla</button>
                  <button className="btn-outline py-2 px-4 text-sm">Reddet</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Staff Management (Manager only)
const StaffUsers = () => {
  const { user } = useAuthStore()

  if (user?.role === 'staff') {
    return (
      <div className="bg-white rounded-xl p-6 text-center">
        <Users className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
        <p className="text-charcoal-500">Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Personel Yönetimi</h1>
      <p className="text-charcoal-500">Personel listesi ve atama işlemleri burada olacak.</p>
    </div>
  )
}

// Sales Logs
const StaffSalesLogs = () => (
  <div className="bg-white rounded-xl p-6">
    <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Satış Logları</h1>
    <p className="text-charcoal-500">Satış logları burada listelenecek.</p>
  </div>
)

export default function StaffDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const isManager = user?.role === 'manager' || user?.role === 'admin'

  const menuItems = [
    { path: '/staff', label: 'Ana Sayfa', icon: LayoutDashboard, end: true },
    { path: '/staff/orders', label: 'Siparişler', icon: ShoppingCart },
    { path: '/staff/sales-logs', label: 'Satış Logları', icon: FileText },
    ...(isManager ? [
      { path: '/staff/stock', label: 'Stok Yönetimi', icon: Package },
      { path: '/staff/users', label: 'Personel', icon: Users },
    ] : []),
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      <Helmet>
        <title>Personel Panel - Perdecim</title>
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
              <p className="text-charcoal-400 text-sm mt-1">
                {isManager ? 'Müdür Panel' : 'Personel Panel'}
              </p>
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
                  <p className="text-charcoal-400 text-sm">
                    {isManager ? 'Müdür' : 'Personel'}
                  </p>
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
              <Route index element={<StaffOverview />} />
              <Route path="orders/*" element={<StaffOrders />} />
              <Route path="sales-logs" element={<StaffSalesLogs />} />
              <Route path="stock" element={<StaffStock />} />
              <Route path="users" element={<StaffUsers />} />
            </Routes>
          </main>
        </div>
      </div>
    </>
  )
}
