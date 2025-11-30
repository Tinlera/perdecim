import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CartDrawer from '../cart/CartDrawer'
import CurtainAnimation from '../ui/CurtainAnimation'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'

export default function Layout({ children }) {
  const location = useLocation()
  const { initialize, isLoading: authLoading } = useAuthStore()
  const { fetchCart } = useCartStore()

  useEffect(() => {
    initialize()
    fetchCart()
  }, [initialize, fetchCart])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col">
      <CurtainAnimation />
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
