import { Link } from 'react-router-dom'
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Truck,
  Shield,
  HeadphonesIcon
} from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { label: 'Hakkımızda', href: '/about' },
      { label: 'İletişim', href: '/contact' },
      { label: 'Kariyer', href: '/careers' },
      { label: 'Blog', href: '/blog' },
    ],
    support: [
      { label: 'Sıkça Sorulan Sorular', href: '/faq' },
      { label: 'Kargo Takibi', href: '/track-order' },
      { label: 'İade ve Değişim', href: '/returns' },
      { label: 'Ödeme Seçenekleri', href: '/payment-options' },
    ],
    legal: [
      { label: 'Gizlilik Politikası', href: '/privacy' },
      { label: 'Kullanım Koşulları', href: '/terms' },
      { label: 'KVKK', href: '/kvkk' },
      { label: 'Çerez Politikası', href: '/cookies' },
    ],
  }

  const features = [
    { icon: Truck, label: '500₺ Üzeri Ücretsiz Kargo' },
    { icon: Shield, label: 'Güvenli Ödeme' },
    { icon: CreditCard, label: 'Taksit İmkanı' },
    { icon: HeadphonesIcon, label: '7/24 Destek' },
  ]

  return (
    <footer className="bg-charcoal-700 text-white">
      {/* Features Bar */}
      <div className="border-b border-charcoal-600">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gold-400/20 rounded-full flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-gold-400" />
                </div>
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <span className="font-display text-3xl text-gold-400 font-bold">
                Perdecim
              </span>
            </Link>
            <p className="mt-4 text-charcoal-300 text-sm leading-relaxed">
              Premium perde ve ev tekstili ürünleriyle yaşam alanlarınıza şıklık katıyoruz. 
              Kaliteli kumaşlar, modern tasarımlar ve profesyonel hizmet anlayışımızla 
              yanınızdayız.
            </p>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a 
                href="tel:+902121234567" 
                className="flex items-center space-x-3 text-charcoal-300 hover:text-gold-400 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">+90 (212) 123 45 67</span>
              </a>
              <a 
                href="mailto:info@perdecim.com" 
                className="flex items-center space-x-3 text-charcoal-300 hover:text-gold-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">info@perdecim.com</span>
              </a>
              <div className="flex items-start space-x-3 text-charcoal-300">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">
                  Örnek Mahallesi, Perde Sokak No:1<br />
                  Kadıköy, İstanbul
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-charcoal-600 rounded-full flex items-center justify-center hover:bg-gold-400 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-charcoal-600 rounded-full flex items-center justify-center hover:bg-gold-400 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-charcoal-600 rounded-full flex items-center justify-center hover:bg-gold-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Kurumsal</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-charcoal-300 hover:text-gold-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Yardım</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-charcoal-300 hover:text-gold-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Yasal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href}
                    className="text-charcoal-300 hover:text-gold-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-charcoal-600">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-charcoal-400 text-sm">
              © {currentYear} Perdecim. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center space-x-4">
              <img src="/images/payment/visa.svg" alt="Visa" className="h-8" />
              <img src="/images/payment/mastercard.svg" alt="Mastercard" className="h-8" />
              <img src="/images/payment/troy.svg" alt="Troy" className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
