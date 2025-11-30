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
  Eye,
  Check,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { adminAPI, ordersAPI } from '../../services/api'
import { formatPrice, formatDateTime, getOrderStatusText, getOrderStatusColor, getPaymentStatusText } from '../../lib/utils'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'

// Staff Overview
const StaffOverview = () => {
  const { user } = useAuthStore()
  const [recentOrders, setRecentOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ordersAPI.getAll({ limit: 5 })
        setRecentOrders(response.data.data?.orders || [])
      } catch (error) {
        console.error('Failed to fetch orders:', error)
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-charcoal-700 mb-4">Son Siparişler</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-charcoal-100 rounded animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-charcoal-500">Henüz sipariş yok.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                  <div>
                    <p className="font-medium text-charcoal-700">
                      #{order.orderNumber}
                    </p>
                    <p className="text-charcoal-500 text-sm">
                      {order.user?.firstName} {order.user?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(order.total)}</p>
                    <span className={`badge text-xs ${getOrderStatusColor(order.status)}`}>
                      {getOrderStatusText(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="text-lg font-semibold text-charcoal-700 mb-4">Hızlı Bilgiler</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
              <span className="text-charcoal-500">Rolünüz</span>
              <span className="font-medium text-charcoal-700">
                {user?.role === 'manager' ? 'Müdür' : user?.role === 'admin' ? 'Yönetici' : 'Personel'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
              <span className="text-charcoal-500">Son Giriş</span>
              <span className="font-medium text-charcoal-700">
                {user?.lastLogin ? formatDateTime(user.lastLogin) : 'İlk giriş'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Staff Orders
const StaffOrders = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, searchQuery])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await ordersAPI.getAll({
        page: pagination.page,
        limit: 10,
        search: searchQuery,
      })
      setOrders(response.data.data?.orders || [])
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.data?.pagination?.totalPages || 1,
      }))
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus })
      toast.success('Sipariş durumu güncellendi')
      fetchOrders()
    } catch (error) {
      toast.error('Durum güncellenemedi')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Siparişler</h1>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Sipariş no veya müşteri ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-charcoal-500">Sipariş bulunamadı</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-charcoal-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Sipariş</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Müşteri</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Tarih</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Tutar</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Durum</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-charcoal-500">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-charcoal-50">
                      <td className="px-6 py-4">
                        <span className="font-medium">#{order.orderNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        {order.user?.firstName} {order.user?.lastName}
                      </td>
                      <td className="px-6 py-4 text-charcoal-500">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`text-sm rounded-full px-3 py-1 border-0 ${getOrderStatusColor(order.status)}`}
                        >
                          <option value="pending">Beklemede</option>
                          <option value="processing">Hazırlanıyor</option>
                          <option value="shipped">Kargoda</option>
                          <option value="delivered">Teslim Edildi</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-charcoal-100 rounded-lg"
                        >
                          <Eye className="w-4 h-4 text-charcoal-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-charcoal-100">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 hover:bg-charcoal-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-charcoal-500">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 hover:bg-charcoal-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Sipariş #{selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-charcoal-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-charcoal-500 text-sm">Müşteri</p>
                  <p className="font-medium">{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                  <p className="text-sm text-charcoal-500">{selectedOrder.user?.email}</p>
                </div>
                <div>
                  <p className="text-charcoal-500 text-sm">Teslimat Adresi</p>
                  <p className="font-medium">{selectedOrder.shippingAddress?.addressLine}</p>
                  <p className="text-sm text-charcoal-500">
                    {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.city}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="font-medium mb-3">Ürünler</p>
                {selectedOrder.items?.map(item => (
                  <div key={item.id} className="flex justify-between py-2">
                    <span>{item.productName} x{item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.total)}</span>
                  </div>
                ))}
                <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                  <span>Toplam</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
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
    fetchStockLogs()
  }, [])

  const fetchStockLogs = async () => {
    try {
      const response = await adminAPI.getStockLogs({ status: 'pending', limit: 20 })
      setStockLogs(response.data.data?.logs || [])
    } catch (error) {
      console.error('Failed to fetch stock logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id, status) => {
    try {
      await adminAPI.approveStockLog(id, status)
      toast.success(status === 'approved' ? 'Stok hareketi onaylandı' : 'Stok hareketi reddedildi')
      fetchStockLogs()
    } catch (error) {
      toast.error('İşlem başarısız')
    }
  }

  if (user?.role === 'staff') {
    return (
      <div className="bg-white rounded-xl p-6 text-center">
        <Package className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
        <p className="text-charcoal-500">Bu sayfaya erişim yetkiniz yok.</p>
        <p className="text-sm text-charcoal-400 mt-2">Stok yönetimi için müdür yetkisi gereklidir.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Stok Yönetimi</h1>

      <div className="bg-white rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          </div>
        ) : stockLogs.length === 0 ? (
          <div className="text-center py-12">
            <Check className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <p className="text-charcoal-500">Onay bekleyen stok hareketi yok.</p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal-100">
            {stockLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-charcoal-700">{log.product?.name}</p>
                  <p className="text-sm text-charcoal-500">
                    {log.type === 'out' ? 'Çıkış' : log.type === 'in' ? 'Giriş' : 'Düzeltme'}: {log.quantity} adet
                  </p>
                  {log.reason && <p className="text-sm text-charcoal-400">{log.reason}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(log.id, 'approved')}
                    className="btn-primary py-2 px-4 text-sm"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Onayla
                  </button>
                  <button
                    onClick={() => handleApprove(log.id, 'rejected')}
                    className="btn-outline py-2 px-4 text-sm text-red-500 border-red-500 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Staff Management (Manager only)
const StaffUsers = () => {
  const { user } = useAuthStore()
  const [staffList, setStaffList] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const response = await usersAPI.getStaff()
      setStaffList(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch staff:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (user?.role === 'staff') {
    return (
      <div className="bg-white rounded-xl p-6 text-center">
        <Users className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
        <p className="text-charcoal-500">Bu sayfaya erişim yetkiniz yok.</p>
        <p className="text-sm text-charcoal-400 mt-2">Personel yönetimi için müdür yetkisi gereklidir.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Personel Listesi</h1>

      <div className="bg-white rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          </div>
        ) : staffList.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-charcoal-500">Henüz personel yok.</p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal-100">
            {staffList.map((staff) => (
              <div key={staff.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gold-400 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-medium">
                      {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{staff.firstName} {staff.lastName}</p>
                    <p className="text-sm text-charcoal-500">{staff.email}</p>
                  </div>
                </div>
                <span className={`badge ${staff.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                  {staff.role === 'manager' ? 'Müdür' : 'Personel'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Sales Logs
const StaffSalesLogs = () => {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await adminAPI.getSalesLogs({ limit: 50 })
      setLogs(response.data.data?.logs || [])
    } catch (error) {
      console.error('Failed to fetch sales logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal-700 mb-6">Satış Logları</h1>

      <div className="bg-white rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
            <p className="text-charcoal-500">Henüz satış logu yok.</p>
          </div>
        ) : (
          <div className="divide-y divide-charcoal-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sipariş #{log.order?.orderNumber}</p>
                    <p className="text-sm text-charcoal-500">{log.action}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-charcoal-400">{formatDateTime(log.createdAt)}</p>
                    {log.staff && (
                      <p className="text-sm text-charcoal-500">
                        {log.staff.firstName} {log.staff.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

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
