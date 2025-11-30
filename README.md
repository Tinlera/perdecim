# 🎭 Perdecim - Premium Perde E-Ticaret Platformu

Modern, şık ve mobil uyumlu perde e-ticaret sitesi. Altın ve beyaz tonlarında lüks bir tasarım ile perdeci dükkanları için özel olarak tasarlanmıştır.

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat-square&logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)

## ✨ Özellikler

### 🎨 Tasarım & UI
- **Tiyatro Perdesi Açılış Animasyonu** - Site açılışında etkileyici perde açılma efekti
- **Altın (#D4AF37) & Beyaz Tema** - Lüks ve şık görünüm
- **Mobile-First Responsive** - Tüm cihazlarda mükemmel deneyim
- **Hover Zoom Efekti** - Ürün resimlerinde PC'de zoom
- **Smooth Animasyonlar** - Framer Motion ile akıcı geçişler

### 🛒 E-Ticaret
- Ürün listesi, varyantlar, açıklama, stok yönetimi
- Sepet sistemi (misafir + üye)
- Favoriler sistemi
- Kupon ve indirim sistemi
- İyzico entegrasyonu (3D Secure)

### 👥 Kullanıcı Yönetimi
- Single Sign-On (tek giriş) sistemi
- 4 farklı kullanıcı rolü
- 2FA (Google Authenticator) desteği
- Şifremi unuttum / Şifre sıfırlama

### 🔐 Güvenlik
- JWT token tabanlı kimlik doğrulama
- XSS koruması (Helmet.js + custom sanitizer)
- SQL Injection koruması (Sequelize ORM)
- Rate limiting
- CORS yapılandırması

## 🏗️ Proje Yapısı

```
perdecim/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/            # DB, Redis yapılandırması
│   │   ├── controllers/       # Route controller'ları
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   ├── adminController.js
│   │   │   └── ...
│   │   ├── middleware/        # Auth, security, upload
│   │   ├── models/            # Sequelize modelleri
│   │   ├── routes/            # API route tanımları
│   │   └── app.js
│   ├── uploads/               # Yüklenen dosyalar
│   └── env.example.txt        # Environment örneği
│
├── frontend/                   # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── cart/          # Sepet bileşenleri
│   │   │   ├── home/          # Ana sayfa bileşenleri
│   │   │   ├── layout/        # Header, Footer, Layout
│   │   │   ├── product/       # Ürün kartları
│   │   │   └── ui/            # UI bileşenleri
│   │   ├── pages/
│   │   │   ├── admin/         # Admin panel sayfaları
│   │   │   ├── staff/         # Personel panel sayfaları
│   │   │   ├── account/       # Hesap sayfaları
│   │   │   └── ...
│   │   ├── services/          # API servisleri
│   │   ├── store/             # Zustand store'ları
│   │   └── lib/               # Utility fonksiyonları
│   └── env.example.txt        # Environment örneği
│
├── docker-compose.yml         # Docker yapılandırması
├── nginx/                     # Nginx yapılandırması
└── scripts/                   # Deploy scriptleri
```

## 🚀 Kurulum

### Gereksinimler

- Node.js 20+
- PostgreSQL 15+
- Redis (opsiyonel, cache için)
- npm veya yarn

### 1. Backend Kurulumu

```bash
cd backend

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
# env.example.txt dosyasını .env olarak kopyala ve düzenle
cp env.example.txt .env

# Veritabanını başlat (PostgreSQL çalışıyor olmalı)
# İlk çalıştırmada tablolar otomatik oluşturulacak

# Geliştirme sunucusunu başlat
npm run dev

# Örnek verileri yükle (opsiyonel)
npm run seed
```

### 2. Frontend Kurulumu

```bash
cd frontend

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur (opsiyonel)
cp env.example.txt .env

# Geliştirme sunucusunu başlat
npm run dev
```

### 3. Docker ile Kurulum

```bash
# Tüm servisleri başlat
docker-compose up -d

# Logları izle
docker-compose logs -f
```

## 🔐 Kullanıcı Rolleri ve Yetkiler

| Rol | Panel | Yetkiler |
|-----|-------|----------|
| **Müşteri** | Hesabım | Ürün görüntüleme, sepet, sipariş, favoriler, adres yönetimi |
| **Personel** | /staff | Müşteri yetkileri + Sipariş yönetimi, kendi satış logları |
| **Müdür** | /staff | Personel yetkileri + Stok onayı, tüm satış logları, personel atama |
| **Yönetici** | /admin | Tüm yetkiler + Site ayarları, animasyon kontrolü, sayfa düzenleme |

### Giriş Davranışı
- Personel/Müdür girişi → Otomatik personel paneline yönlendirme
- Müşteri girişi → Ana sayfaya yönlendirme
- Admin → Admin paneline yönlendirme

## 🎨 Renk Paleti

| Renk | Hex | Kullanım |
|------|-----|----------|
| Altın (Primary) | `#D4AF37` | Butonlar, vurgular |
| Altın Koyu | `#B8960C` | Hover durumları |
| Altın Açık | `#F7E98E` | Arka planlar |
| Beyaz | `#FFFFFF` | Ana arka plan |
| Soft Gri | `#F5F5F5` | İkincil arka plan |
| Koyu Gri | `#333333` | Metin |

## 📱 API Endpoints

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Yeni kullanıcı kaydı |
| POST | `/api/auth/login` | Giriş yapma |
| POST | `/api/auth/logout` | Çıkış yapma |
| GET | `/api/auth/me` | Mevcut kullanıcı bilgisi |
| POST | `/api/auth/forgot-password` | Şifre sıfırlama linki |
| POST | `/api/auth/reset-password` | Şifre sıfırlama |
| POST | `/api/auth/2fa/setup` | 2FA kurulumu |
| POST | `/api/auth/2fa/verify` | 2FA doğrulama |

### Products
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/products` | Ürün listesi |
| GET | `/api/products/:slug` | Ürün detayı |
| POST | `/api/products` | Ürün ekleme (Admin) |
| PUT | `/api/products/:id` | Ürün güncelleme (Admin) |
| DELETE | `/api/products/:id` | Ürün silme (Admin) |

### Categories
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/categories` | Kategori listesi |
| GET | `/api/categories/:slug` | Kategori detayı |
| POST | `/api/categories` | Kategori ekleme (Admin) |

### Cart
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/cart` | Sepeti görüntüle |
| POST | `/api/cart/add` | Sepete ürün ekle |
| PUT | `/api/cart/items/:id` | Sepet öğesini güncelle |
| DELETE | `/api/cart/items/:id` | Sepetten ürün çıkar |

### Orders
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/orders` | Sipariş listesi |
| POST | `/api/orders` | Sipariş oluştur |
| GET | `/api/orders/:id` | Sipariş detayı |
| PUT | `/api/orders/:id/status` | Sipariş durumu güncelle |

### Payment (İyzico)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/payment/initialize` | 3D Secure ödeme başlat |
| POST | `/api/payment/callback` | İyzico callback |
| GET | `/api/payment/status/:orderId` | Ödeme durumu |

## 🛠️ Admin Panel Özellikleri

- **Dashboard** - Günlük/aylık istatistikler
- **Ürün Yönetimi** - CRUD, varyantlar, resimler
- **Kategori Yönetimi** - Hiyerarşik kategoriler
- **Sipariş Yönetimi** - Durum güncelleme, detay görüntüleme
- **Kullanıcı Yönetimi** - Rol atama, hesap durumu
- **Kupon Yönetimi** - İndirim kuponları
- **Banner/Slider** - Ana sayfa slider yönetimi
- **Sayfa Yönetimi** - Hakkımızda, İletişim sayfaları
- **Site Ayarları** - Genel ayarlar, animasyon kontrolü

## 🧪 Test Ödeme

İyzico Sandbox ile test için:
- Kart No: `5528790000000008`
- SKT: Gelecek bir tarih (örn: `12/30`)
- CVV: `123`

## 📝 Geliştirme Notları

### Environment Değişkenleri

Backend için kritik değişkenler:
```env
JWT_SECRET=min_32_karakter_gizli_anahtar
JWT_REFRESH_SECRET=min_32_karakter_gizli_anahtar
IYZICO_API_KEY=iyzico_api_key
IYZICO_SECRET_KEY=iyzico_secret_key
```

### Veritabanı Senkronizasyonu
Development modunda Sequelize `alter: true` ile çalışır, tablolar otomatik güncellenir.
Production'da migration kullanılmalıdır.

## 🐳 Docker Deployment

```bash
# Production build ve başlatma
docker-compose -f docker-compose.yml up -d --build

# Servisleri durdur
docker-compose down

# Logları görüntüle
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'e push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

Made with ❤️ for Perdecim
