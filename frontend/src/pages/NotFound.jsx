import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Sayfa Bulunamadı - Perdecim</title>
      </Helmet>

      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-9xl font-bold text-gold-400">404</h1>
          <h2 className="text-2xl font-semibold text-charcoal-700 mt-4">
            Sayfa Bulunamadı
          </h2>
          <p className="text-charcoal-500 mt-2 max-w-md mx-auto">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
          <div className="flex items-center justify-center space-x-4 mt-8">
            <button
              onClick={() => window.history.back()}
              className="btn-outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri Dön
            </button>
            <Link to="/" className="btn-primary">
              <Home className="w-4 h-4 mr-2" />
              Ana Sayfa
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
