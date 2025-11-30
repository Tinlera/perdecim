import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import { cn } from '../lib/utils'

// Sub-pages
import AccountOverview from './account/Overview'
import AccountOrders from './account/Orders'
import AccountFavorites from './account/Favorites'
import AccountAddresses from './account/Addresses'
import AccountSettings from './account/Settings'
import AccountSecurity from './account/Security'

const menuItems = [
  { path: '/account', label: 'Hesap Özeti', icon: User, end: true },
  { path: '/account/orders', label: 'Siparişlerim', icon: Package },
  { path: '/account/favorites', label: 'Favorilerim', icon: Heart },
  { path: '/account/addresses', label: 'Adreslerim', icon: MapPin },
  { path: '/account/settings', label: 'Ayarlar', icon: Settings },
  { path: '/account/security', label: 'Güvenlik', icon: Shield },
]

export default function Account() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      <Helmet>
        <title>Hesabım - Perdecim</title>
      </Helmet>

      <div className="min-h-screen bg-charcoal-50 py-8">
        <div className="container-custom">
          <h1 className="font-display text-3xl font-bold text-charcoal-700 mb-8">
            Hesabım
          </h1>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6">
                {/* User Info */}
                <div className="text-center pb-6 border-b border-charcoal-100">
                  <div className="w-20 h-20 bg-gold-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <h2 className="font-semibold text-charcoal-700">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-charcoal-500 text-sm">{user?.email}</p>
                </div>

                {/* Menu */}
                <nav className="mt-6 space-y-1">
                  {menuItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                          isActive
                            ? 'bg-gold-100 text-gold-700'
                            : 'text-charcoal-600 hover:bg-charcoal-50'
                        )
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 w-full transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Çıkış Yap</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <Routes>
                <Route index element={<AccountOverview />} />
                <Route path="orders" element={<AccountOrders />} />
                <Route path="orders/:id" element={<AccountOrders />} />
                <Route path="favorites" element={<AccountFavorites />} />
                <Route path="addresses" element={<AccountAddresses />} />
                <Route path="settings" element={<AccountSettings />} />
                <Route path="security" element={<AccountSecurity />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
