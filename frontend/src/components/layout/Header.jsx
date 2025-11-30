import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Search,
  ShoppingBag,
  Heart,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  LayoutDashboard,
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'
import useUIStore from '../../store/uiStore'
import { cn } from '../../lib/utils'

export default function Header() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, isStaffOrAbove } = useAuthStore()
  const { itemCount, openCart } = useCartStore()
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore()
  
  const [isScrolled, setIsScrolled] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await logout()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/products', label: 'Ürünler' },
    { href: '/categories', label: 'Kategoriler' },
    { href: '/about', label: 'Hakkımızda' },
    { href: '/contact', label: 'İletişim' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      )}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-display text-2xl md:text-3xl text-gold-400 font-bold">
              Perdecim
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-gold-400',
                  isScrolled ? 'text-charcoal-500' : 'text-charcoal-600'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-48 pl-10 pr-4 py-2 rounded-full text-sm border transition-all focus:w-64',
                  isScrolled
                    ? 'bg-charcoal-50 border-charcoal-200 focus:border-gold-400'
                    : 'bg-white/80 border-white/50 focus:border-gold-400'
                )}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            </form>

            {/* Favorites */}
            {isAuthenticated && (
              <Link
                to="/account/favorites"
                className="p-2 rounded-full hover:bg-charcoal-100 transition-colors"
              >
                <Heart className="w-5 h-5 text-charcoal-500" />
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-charcoal-100 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-charcoal-500" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-400 text-white text-xs rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-charcoal-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.charAt(0)}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-charcoal-500" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-charcoal-100 overflow-hidden"
                    >
                      <div className="p-4 border-b border-charcoal-100">
                        <p className="font-medium text-charcoal-700">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-charcoal-400">{user?.email}</p>
                      </div>
                      <div className="py-2">
                        {isStaffOrAbove() && (
                          <Link
                            to={user?.role === 'admin' ? '/admin' : '/staff'}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-2 hover:bg-charcoal-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-charcoal-400" />
                            <span className="text-sm">
                              {user?.role === 'admin' ? 'Admin Panel' : 'Personel Panel'}
                            </span>
                          </Link>
                        )}
                        <Link
                          to="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-charcoal-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-charcoal-400" />
                          <span className="text-sm">Hesabım</span>
                        </Link>
                        <Link
                          to="/account/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-charcoal-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-charcoal-400" />
                          <span className="text-sm">Siparişlerim</span>
                        </Link>
                        <Link
                          to="/account/settings"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-charcoal-50 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-charcoal-400" />
                          <span className="text-sm">Ayarlar</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 px-4 py-2 w-full hover:bg-charcoal-50 transition-colors text-red-500"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Çıkış Yap</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2">
                Giriş Yap
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-4 lg:hidden">
            <button
              onClick={openCart}
              className="relative p-2"
            >
              <ShoppingBag className="w-6 h-6 text-charcoal-500" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-400 text-white text-xs rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button onClick={toggleMobileMenu} className="p-2">
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-charcoal-500" />
              ) : (
                <Menu className="w-6 h-6 text-charcoal-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-charcoal-100"
          >
            <div className="container-custom py-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-charcoal-50 border border-charcoal-200"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
              </form>

              {/* Mobile Nav Links */}
              <nav className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 rounded-lg hover:bg-charcoal-50 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile User Section */}
              <div className="mt-4 pt-4 border-t border-charcoal-100">
                {isAuthenticated ? (
                  <div className="space-y-1">
                    <div className="px-4 py-2">
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-charcoal-400">{user?.email}</p>
                    </div>
                    {isStaffOrAbove() && (
                      <Link
                        to={user?.role === 'admin' ? '/admin' : '/staff'}
                        onClick={closeMobileMenu}
                        className="block px-4 py-3 rounded-lg hover:bg-charcoal-50"
                      >
                        {user?.role === 'admin' ? 'Admin Panel' : 'Personel Panel'}
                      </Link>
                    )}
                    <Link
                      to="/account"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 rounded-lg hover:bg-charcoal-50"
                    >
                      Hesabım
                    </Link>
                    <Link
                      to="/account/orders"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 rounded-lg hover:bg-charcoal-50"
                    >
                      Siparişlerim
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 rounded-lg hover:bg-charcoal-50 text-red-500"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-3 px-4">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="flex-1 btn-primary text-center"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="flex-1 btn-outline text-center"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
