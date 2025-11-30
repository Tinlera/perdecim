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
  Phone,
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
  const [isSearchOpen, setIsSearchOpen] = useState(false)

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
      setIsSearchOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/products', label: 'Koleksiyon' },
    { href: '/categories', label: 'Kategoriler' },
    { href: '/about', label: 'Hakkımızda' },
    { href: '/contact', label: 'İletişim' },
  ]

  return (
    <>
      {/* Top Bar */}
      <div className={cn(
        'hidden lg:block transition-all duration-300',
        isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-10 opacity-100'
      )}>
        <div className="bg-charcoal-900 text-white/80 text-sm">
          <div className="container-custom flex items-center justify-between h-10">
            <div className="flex items-center gap-6">
              <a href="tel:+905551234567" className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <Phone className="w-3.5 h-3.5" />
                <span>+90 555 123 45 67</span>
              </a>
              <span className="text-charcoal-600">|</span>
              <span>Ücretsiz Kargo & Montaj</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gold-400">✦</span>
              <span>Yeni Sezon Koleksiyonu</span>
              <span className="text-gold-400">✦</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'fixed left-0 right-0 z-40 transition-all duration-500',
          isScrolled
            ? 'top-0 bg-white/95 backdrop-blur-xl shadow-elegant border-b border-charcoal-100/50'
            : 'top-10 lg:top-10 bg-white/80 backdrop-blur-md'
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <span className="font-display text-2xl md:text-3xl font-bold tracking-tight">
                  <span className="text-gradient-premium">Perdecim</span>
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 group-hover:w-full transition-all duration-500" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="relative px-5 py-2 text-sm font-medium text-charcoal-600 hover:text-charcoal-900 transition-colors group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gold-400 group-hover:w-1/2 transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-3 rounded-full hover:bg-charcoal-100/80 transition-all duration-300"
              >
                <Search className="w-5 h-5 text-charcoal-600" />
              </button>

              {/* Favorites */}
              {isAuthenticated && (
                <Link
                  to="/account/favorites"
                  className="p-3 rounded-full hover:bg-charcoal-100/80 transition-all duration-300"
                >
                  <Heart className="w-5 h-5 text-charcoal-600" />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-3 rounded-full hover:bg-charcoal-100/80 transition-all duration-300"
              >
                <ShoppingBag className="w-5 h-5 text-charcoal-600" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-5 h-5 bg-gradient-to-r from-gold-500 to-gold-400 text-charcoal-900 text-xs font-bold rounded-full flex items-center justify-center shadow-gold"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-charcoal-200 mx-2" />

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-charcoal-100/80 transition-all duration-300"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-gold">
                      <span className="text-white text-sm font-semibold">
                        {user?.firstName?.charAt(0)}
                      </span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-charcoal-500 transition-transform duration-300",
                      isUserMenuOpen && "rotate-180"
                    )} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <>
                        {/* Backdrop */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40"
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-premium-lg border border-charcoal-100 overflow-hidden z-50"
                        >
                          <div className="p-5 bg-gradient-to-br from-charcoal-50 to-white border-b border-charcoal-100">
                            <p className="font-semibold text-charcoal-800">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-sm text-charcoal-400 mt-0.5">{user?.email}</p>
                          </div>
                          <div className="py-2">
                            {isStaffOrAbove() && (
                              <Link
                                to={user?.role === 'admin' ? '/admin' : '/staff'}
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center space-x-3 px-5 py-3 hover:bg-gold-50 transition-colors group"
                              >
                                <LayoutDashboard className="w-4 h-4 text-charcoal-400 group-hover:text-gold-500" />
                                <span className="text-sm text-charcoal-600 group-hover:text-charcoal-900">
                                  {user?.role === 'admin' ? 'Admin Panel' : 'Personel Panel'}
                                </span>
                              </Link>
                            )}
                            <Link
                              to="/account"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-5 py-3 hover:bg-gold-50 transition-colors group"
                            >
                              <User className="w-4 h-4 text-charcoal-400 group-hover:text-gold-500" />
                              <span className="text-sm text-charcoal-600 group-hover:text-charcoal-900">Hesabım</span>
                            </Link>
                            <Link
                              to="/account/orders"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-5 py-3 hover:bg-gold-50 transition-colors group"
                            >
                              <Package className="w-4 h-4 text-charcoal-400 group-hover:text-gold-500" />
                              <span className="text-sm text-charcoal-600 group-hover:text-charcoal-900">Siparişlerim</span>
                            </Link>
                            <Link
                              to="/account/settings"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-5 py-3 hover:bg-gold-50 transition-colors group"
                            >
                              <Settings className="w-4 h-4 text-charcoal-400 group-hover:text-gold-500" />
                              <span className="text-sm text-charcoal-600 group-hover:text-charcoal-900">Ayarlar</span>
                            </Link>
                            <div className="mx-4 my-2 h-px bg-charcoal-100" />
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-3 px-5 py-3 w-full hover:bg-red-50 transition-colors group"
                            >
                              <LogOut className="w-4 h-4 text-charcoal-400 group-hover:text-red-500" />
                              <span className="text-sm text-charcoal-600 group-hover:text-red-600">Çıkış Yap</span>
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-charcoal-900 rounded-full text-sm font-semibold hover:shadow-gold transition-all duration-300"
                >
                  Giriş Yap
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-3 lg:hidden">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 rounded-full hover:bg-charcoal-100/80 transition-colors"
              >
                <Search className="w-5 h-5 text-charcoal-600" />
              </button>
              <button
                onClick={openCart}
                className="relative p-2.5"
              >
                <ShoppingBag className="w-5 h-5 text-charcoal-600" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-gradient-to-r from-gold-500 to-gold-400 text-charcoal-900 text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
              <button 
                onClick={toggleMobileMenu} 
                className="p-2.5 rounded-full hover:bg-charcoal-100/80 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-charcoal-600" />
                ) : (
                  <Menu className="w-6 h-6 text-charcoal-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-white shadow-premium border-t border-charcoal-100"
            >
              <div className="container-custom py-6">
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                  <input
                    type="text"
                    placeholder="Ne aramıştınız?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-14 pr-6 py-4 text-lg rounded-2xl bg-charcoal-50 border-2 border-transparent focus:border-gold-400 focus:bg-white transition-all duration-300 outline-none"
                  />
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-charcoal-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-charcoal-400" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeMobileMenu}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Close Button */}
                <div className="flex justify-between items-center mb-8">
                  <span className="font-display text-2xl font-bold text-gradient-premium">Perdecim</span>
                  <button
                    onClick={closeMobileMenu}
                    className="p-2 rounded-full hover:bg-charcoal-100 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* User Info */}
                {isAuthenticated && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-charcoal-50 to-white rounded-2xl">
                    <p className="font-semibold text-charcoal-800">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-charcoal-400">{user?.email}</p>
                  </div>
                )}

                {/* Nav Links */}
                <nav className="space-y-1 mb-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={closeMobileMenu}
                      className="block px-4 py-3.5 rounded-xl text-charcoal-700 hover:bg-gold-50 hover:text-gold-600 transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="h-px bg-charcoal-100 my-6" />

                {/* Account Links */}
                {isAuthenticated ? (
                  <div className="space-y-1">
                    {isStaffOrAbove() && (
                      <Link
                        to={user?.role === 'admin' ? '/admin' : '/staff'}
                        onClick={closeMobileMenu}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gold-50 transition-colors"
                      >
                        <LayoutDashboard className="w-5 h-5 text-charcoal-400" />
                        <span className="text-charcoal-700 font-medium">
                          {user?.role === 'admin' ? 'Admin Panel' : 'Personel Panel'}
                        </span>
                      </Link>
                    )}
                    <Link
                      to="/account"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gold-50 transition-colors"
                    >
                      <User className="w-5 h-5 text-charcoal-400" />
                      <span className="text-charcoal-700 font-medium">Hesabım</span>
                    </Link>
                    <Link
                      to="/account/orders"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gold-50 transition-colors"
                    >
                      <Package className="w-5 h-5 text-charcoal-400" />
                      <span className="text-charcoal-700 font-medium">Siparişlerim</span>
                    </Link>
                    <Link
                      to="/account/favorites"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-gold-50 transition-colors"
                    >
                      <Heart className="w-5 h-5 text-charcoal-400" />
                      <span className="text-charcoal-700 font-medium">Favorilerim</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl w-full hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-5 h-5 text-red-400" />
                      <span className="text-red-600 font-medium">Çıkış Yap</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block w-full text-center py-3.5 bg-gradient-to-r from-gold-500 to-gold-400 text-charcoal-900 rounded-xl font-semibold"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="block w-full text-center py-3.5 border-2 border-charcoal-200 text-charcoal-700 rounded-xl font-semibold hover:border-gold-400 hover:text-gold-600 transition-colors"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}

                {/* Contact */}
                <div className="mt-8 p-4 bg-charcoal-50 rounded-2xl">
                  <p className="text-sm text-charcoal-500 mb-2">Yardıma mı ihtiyacınız var?</p>
                  <a href="tel:+905551234567" className="flex items-center gap-2 text-gold-600 font-semibold">
                    <Phone className="w-4 h-4" />
                    +90 555 123 45 67
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
