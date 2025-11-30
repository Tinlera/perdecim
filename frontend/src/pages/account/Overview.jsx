import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Heart, MapPin, ChevronRight } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { ordersAPI, usersAPI } from '../../services/api'
import { formatPrice, formatDate, getOrderStatusText, getOrderStatusColor } from '../../lib/utils'

export default function AccountOverview() {
  const { user } = useAuthStore()
  const [recentOrders, setRecentOrders] = useState([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    favorites: 0,
    addresses: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, favoritesRes, addressesRes] = await Promise.all([
          ordersAPI.getMyOrders({ limit: 3 }),
          usersAPI.getFavorites(),
          usersAPI.getAddresses(),
        ])

        setRecentOrders(ordersRes.data.data.orders)
        setStats({
          totalOrders: ordersRes.data.data.pagination.total,
          favorites: favoritesRes.data.data.length,
          addresses: addressesRes.data.data.length,
        })
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const quickStats = [
    {
      label: 'Toplam Sipariş',
      value: stats.totalOrders,
      icon: Package,
      href: '/account/orders',
    },
    {
      label: 'Favoriler',
      value: stats.favorites,
      icon: Heart,
      href: '/account/favorites',
    },
    {
      label: 'Kayıtlı Adres',
      value: stats.addresses,
      icon: MapPin,
      href: '/account/addresses',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-xl font-semibold text-charcoal-700">
          Hoş geldiniz, {user?.firstName}!
        </h2>
        <p className="text-charcoal-500 mt-1">
          Hesabınızı buradan yönetebilirsiniz.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {quickStats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.href}
            className="bg-white rounded-xl p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-charcoal-700">{stat.value}</p>
                <p className="text-charcoal-500 text-sm">{stat.label}</p>
              </div>
              <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-gold-500" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-charcoal-700">Son Siparişler</h3>
          <Link
            to="/account/orders"
            className="text-gold-500 hover:text-gold-600 text-sm flex items-center"
          >
            Tümünü Gör
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-charcoal-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-charcoal-200 mx-auto mb-3" />
            <p className="text-charcoal-500">Henüz siparişiniz yok</p>
            <Link to="/products" className="text-gold-500 hover:text-gold-600 text-sm mt-2 inline-block">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-charcoal-700">
                    #{order.orderNumber}
                  </p>
                  <p className="text-charcoal-500 text-sm">
                    {formatDate(order.createdAt)}
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
