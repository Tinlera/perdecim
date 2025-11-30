import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Mail, 
  Phone, 
  MapPin,
  ArrowUpRight,
  Sparkles
} from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    shop: [
      { label: 'Tül Perdeler', href: '/products?category=tul' },
      { label: 'Fon Perdeler', href: '/products?category=fon' },
      { label: 'Blackout', href: '/products?category=blackout' },
      { label: 'Stor Perdeler', href: '/products?category=stor' },
      { label: 'Aksesuar', href: '/products?category=aksesuar' },
    ],
    company: [
      { label: 'Hakkımızda', href: '/about' },
      { label: 'Showroom', href: '/showroom' },
      { label: 'Blog', href: '/blog' },
      { label: 'Kariyer', href: '/careers' },
      { label: 'İletişim', href: '/contact' },
    ],
    support: [
      { label: 'SSS', href: '/faq' },
      { label: 'Kargo & Teslimat', href: '/shipping' },
      { label: 'İade Politikası', href: '/returns' },
      { label: 'Garanti', href: '/warranty' },
      { label: 'Ölçü Rehberi', href: '/measurement-guide' },
    ],
  }

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Youtube, href: 'https://youtube.com', label: 'Youtube' },
  ]

  return (
    <footer className="bg-charcoal-900 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
      <div className="absolute top-20 -left-20 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />

      {/* Main Footer */}
      <div className="container-custom relative">
        {/* Top Section */}
        <div className="py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-block group">
              <span className="font-display text-3xl font-bold text-gradient-premium">
                Perdecim
              </span>
            </Link>
            <p className="mt-6 text-charcoal-400 leading-relaxed max-w-sm">
              1998'den bu yana premium perde ve ev tekstili ürünleriyle yaşam 
              alanlarınıza zarafet katıyoruz. İtalyan kumaşlar, özgün tasarımlar.
            </p>
            
            {/* Contact */}
            <div className="mt-8 space-y-4">
              <a 
                href="tel:+905551234567" 
                className="group flex items-center gap-3 text-charcoal-300 hover:text-gold-400 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center group-hover:bg-gold-400/20 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-charcoal-500 block">Bizi Arayın</span>
                  <span className="font-medium">+90 555 123 45 67</span>
                </div>
              </a>
              <a 
                href="mailto:info@perdecim.com" 
                className="group flex items-center gap-3 text-charcoal-300 hover:text-gold-400 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-charcoal-800 flex items-center justify-center group-hover:bg-gold-400/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-charcoal-500 block">E-posta</span>
                  <span className="font-medium">info@perdecim.com</span>
                </div>
              </a>
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <p className="text-sm text-charcoal-500 mb-4">Bizi Takip Edin</p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a 
                    key={social.label}
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-11 h-11 bg-charcoal-800 rounded-full flex items-center justify-center hover:bg-gold-400 hover:text-charcoal-900 transition-all duration-300 group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Shop */}
            <div>
              <h4 className="text-white font-semibold mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                Koleksiyon
              </h4>
              <ul className="space-y-4">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href}
                      className="text-charcoal-400 hover:text-gold-400 transition-colors text-sm inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-6">Kurumsal</h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href}
                      className="text-charcoal-400 hover:text-gold-400 transition-colors text-sm inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-6">Yardım</h4>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href}
                      className="text-charcoal-400 hover:text-gold-400 transition-colors text-sm inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-charcoal-700 to-transparent" />

        {/* Bottom Section */}
        <div className="py-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-charcoal-500">
            <span>© {currentYear} Perdecim. Tüm hakları saklıdır.</span>
            <div className="hidden sm:block w-1 h-1 bg-charcoal-600 rounded-full" />
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-gold-400 transition-colors">
                Gizlilik
              </Link>
              <Link to="/terms" className="hover:text-gold-400 transition-colors">
                Şartlar
              </Link>
              <Link to="/kvkk" className="hover:text-gold-400 transition-colors">
                KVKK
              </Link>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-charcoal-500 mr-2">Güvenli Ödeme:</span>
            <div className="flex items-center gap-2">
              {['Visa', 'Mastercard', 'Troy', 'Iyzico'].map((method) => (
                <div 
                  key={method}
                  className="h-8 px-3 bg-charcoal-800 rounded-md flex items-center justify-center text-charcoal-400 text-xs font-medium"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Location Bar */}
      <div className="bg-charcoal-800/50 border-t border-charcoal-800">
        <div className="container-custom py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-charcoal-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-400" />
              <span>Showroom: Bağdat Caddesi No:123, Kadıköy/İstanbul</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-charcoal-600 rounded-full" />
            <span>Pzt-Cmt: 10:00 - 20:00</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
