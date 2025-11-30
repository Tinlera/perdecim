import { useState, useEffect } from 'react'
import {
  Search,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import { ordersAPI } from '../../services/api'
import { formatPrice, formatDateTime, getOrderStatusText, getOrderStatusColor, getPaymentStatusText } from '../../lib/utils'
import toast from 'react-hot-toast'

const statusOptions = [
  { value: 'pending', label: 'Beklemede', icon: Clock },
  { value: 'processing', label: 'Hazırlanıyor', icon: Package },
  { value: 'shipped', label: 'Kargoda', icon: Truck },
  { value: 'delivered', label: 'Teslim Edildi', icon: CheckCircle },
  { value: 'cancelled', label: 'İptal Edildi', icon: XCircle },
]

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [pagination.page, searchQuery, statusFilter])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await ordersAPI.getAll({
        page: pagination.page,
        limit: 10,
        search: searchQuery,
        status: statusFilter,
      })
      setOrders(response.data.data.orders || [])
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.data.pagination?.totalPages || 1,
      }))
    } catch (error) {
      toast.error('Siparişler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const openOrderDetail = async (orderId) => {
    try {
      const response = await ordersAPI.getById(orderId)
      setSelectedOrder(response.data.data)
      setIsModalOpen(true)
    } catch (error) {
      toast.error('Sipariş detayları yüklenemedi')
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus })
      toast.success('Sipariş durumu güncellendi')
      fetchOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }))
      }
    } catch (error) {
      toast.error('Durum güncellenemedi')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-charcoal-700">Sipariş Yönetimi</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Sipariş no veya müşteri ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="">Tüm Durumlar</option>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
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
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Sipariş No</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Müşteri</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Tarih</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Tutar</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Ödeme</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-charcoal-500">Durum</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-charcoal-500">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-charcoal-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-charcoal-700">#{order.orderNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-charcoal-700">{order.user?.firstName} {order.user?.lastName}</p>
                          <p className="text-sm text-charcoal-400">{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-charcoal-500">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-charcoal-700">{formatPrice(order.total)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : order.paymentStatus === 'failed' ? 'badge-error' : 'badge-warning'}`}>
                          {getPaymentStatusText(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`text-sm rounded-full px-3 py-1 border-0 ${getOrderStatusColor(order.status)}`}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openOrderDetail(order.id)}
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

            {/* Pagination */}
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
                  Sayfa {pagination.page} / {pagination.totalPages}
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
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-charcoal-700">
                Sipariş #{selectedOrder.orderNumber}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-charcoal-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <span className={`badge ${getOrderStatusColor(selectedOrder.status)}`}>
                    {getOrderStatusText(selectedOrder.status)}
                  </span>
                  <span className={`badge ml-2 ${selectedOrder.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                    {getPaymentStatusText(selectedOrder.paymentStatus)}
                  </span>
                </div>
                <p className="text-charcoal-500">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>

              {/* Customer */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-charcoal-700 mb-2">Müşteri</h3>
                  <p>{selectedOrder.user?.firstName} {selectedOrder.user?.lastName}</p>
                  <p className="text-charcoal-500">{selectedOrder.user?.email}</p>
                  <p className="text-charcoal-500">{selectedOrder.user?.phone}</p>
                </div>
                <div>
                  <h3 className="font-medium text-charcoal-700 mb-2">Teslimat Adresi</h3>
                  <p>{selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                  <p className="text-charcoal-500">{selectedOrder.shippingAddress?.addressLine}</p>
                  <p className="text-charcoal-500">
                    {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.city}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-medium text-charcoal-700 mb-4">Ürünler</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        {item.variantName && <p className="text-sm text-charcoal-500">{item.variantName}</p>}
                        <p className="text-sm text-charcoal-500">x{item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.total)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Ara Toplam</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>İndirim</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Kargo</span>
                  <span>{selectedOrder.shippingCost > 0 ? formatPrice(selectedOrder.shippingCost) : 'Ücretsiz'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Toplam</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-medium text-charcoal-700 mb-2">Notlar</h3>
                  <p className="text-charcoal-500 bg-charcoal-50 p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

