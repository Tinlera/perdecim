import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Package, ChevronLeft, Truck, Check, X } from 'lucide-react'
import { ordersAPI } from '../../services/api'
import { formatPrice, formatDateTime, getOrderStatusText, getOrderStatusColor, getPaymentStatusText } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function AccountOrders() {
  const { id } = useParams()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [pagination, setPagination] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (id) {
      fetchOrderDetail(id)
    } else {
      fetchOrders()
    }
  }, [id, page])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await ordersAPI.getMyOrders({ page, limit: 10 })
      setOrders(response.data.data.orders)
      setPagination(response.data.data.pagination)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrderDetail = async (orderId) => {
    setIsLoading(true)
    try {
      const response = await ordersAPI.getById(orderId)
      setSelectedOrder(response.data.data)
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Siparişi iptal etmek istediğinize emin misiniz?')) return

    try {
      await ordersAPI.cancel(orderId)
      toast.success('Sipariş iptal edildi')
      if (selectedOrder) {
        fetchOrderDetail(orderId)
      } else {
        fetchOrders()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'İptal edilemedi')
    }
  }

  // Order Detail View
  if (selectedOrder) {
    return (
      <div className="space-y-6">
        <Link
          to="/account/orders"
          className="flex items-center text-charcoal-500 hover:text-gold-500"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Siparişlere Dön
        </Link>

        <div className="bg-white rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-charcoal-700">
                Sipariş #{selectedOrder.orderNumber}
              </h2>
              <p className="text-charcoal-500 text-sm mt-1">
                {formatDateTime(selectedOrder.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <span className={`badge ${getOrderStatusColor(selectedOrder.status)}`}>
                {getOrderStatusText(selectedOrder.status)}
              </span>
              <p className="text-charcoal-500 text-sm mt-1">
                Ödeme: {getPaymentStatusText(selectedOrder.paymentStatus)}
              </p>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="flex items-center justify-between mb-8 px-4">
            {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
              const statusIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(selectedOrder.status)
              const isCompleted = index <= statusIndex
              const isCurrent = index === statusIndex

              return (
                <div key={status} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-charcoal-200 text-charcoal-400'
                    }`}
                  >
                    {status === 'delivered' ? (
                      <Check className="w-5 h-5" />
                    ) : status === 'shipped' ? (
                      <Truck className="w-5 h-5" />
                    ) : (
                      <Package className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${isCurrent ? 'font-medium text-charcoal-700' : 'text-charcoal-400'}`}>
                    {getOrderStatusText(status)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Items */}
          <div className="border-t border-charcoal-100 pt-6">
            <h3 className="font-medium text-charcoal-700 mb-4">Ürünler</h3>
            <div className="space-y-4">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-charcoal-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-charcoal-300" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-charcoal-700">{item.productName}</p>
                    {item.variantName && (
                      <p className="text-charcoal-500 text-sm">{item.variantName}</p>
                    )}
                    <p className="text-charcoal-500 text-sm">
                      {item.quantity} adet × {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="font-medium text-charcoal-700">
                    {formatPrice(item.total)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="border-t border-charcoal-100 pt-6 mt-6">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-500">Ara Toplam</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-500">Kargo</span>
                  <span>
                    {selectedOrder.shippingCost === 0
                      ? 'Ücretsiz'
                      : formatPrice(selectedOrder.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-charcoal-100">
                  <span>Toplam</span>
                  <span className="text-gold-500">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="border-t border-charcoal-100 pt-6 mt-6">
            <h3 className="font-medium text-charcoal-700 mb-4">Teslimat Adresi</h3>
            <div className="bg-charcoal-50 rounded-lg p-4">
              <p className="font-medium">
                {selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}
              </p>
              <p className="text-charcoal-600 text-sm mt-1">
                {selectedOrder.shippingAddress?.addressLine}
              </p>
              <p className="text-charcoal-600 text-sm">
                {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.city}
              </p>
              <p className="text-charcoal-600 text-sm">
                {selectedOrder.shippingAddress?.phone}
              </p>
            </div>
          </div>

          {/* Actions */}
          {['pending', 'processing'].includes(selectedOrder.status) && (
            <div className="border-t border-charcoal-100 pt-6 mt-6">
              <button
                onClick={() => handleCancelOrder(selectedOrder.id)}
                className="btn-outline text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
              >
                <X className="w-4 h-4 mr-2" />
                Siparişi İptal Et
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Orders List View
  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="text-xl font-semibold text-charcoal-700 mb-6">Siparişlerim</h2>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-charcoal-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-charcoal-200 mx-auto mb-4" />
          <p className="text-charcoal-500 mb-4">Henüz siparişiniz yok</p>
          <Link to="/products" className="btn-primary">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="block p-4 border border-charcoal-100 rounded-lg hover:border-gold-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-charcoal-700">
                      #{order.orderNumber}
                    </p>
                    <p className="text-charcoal-500 text-sm">
                      {formatDateTime(order.createdAt)}
                    </p>
                    <p className="text-charcoal-500 text-sm mt-1">
                      {order.items?.length || 0} ürün
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-charcoal-700">
                      {formatPrice(order.total)}
                    </p>
                    <span className={`badge ${getOrderStatusColor(order.status)} mt-1`}>
                      {getOrderStatusText(order.status)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    page === i + 1
                      ? 'bg-gold-400 text-white'
                      : 'bg-charcoal-100 hover:bg-charcoal-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
