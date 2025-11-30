# 🎭 Perdecim - E-Ticaret Platformu

Modern, şık ve mobil uyumlu perde e-ticaret sitesi.

## 🎨 Özellikler

- **Tiyatro Perdesi Açılış Animasyonu** - Site açılışında etkileyici animasyon
- **Altın & Beyaz Tema** - Lüks ve şık tasarım
- **Responsive Tasarım** - Mobile-first yaklaşım
- **Hover Zoom Efekti** - Ürün resimlerinde hover ile zoom
- **Rol Tabanlı Yetkilendirme** - Müşteri, Personel, Müdür, Yönetici
- **2FA Güvenlik** - Google Authenticator desteği
- **İyzico Entegrasyonu** - Güvenli ödeme altyapısı

## 🏗️ Proje Yapısı

```
perdecim/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Yapılandırma dosyaları
│   │   ├── controllers/    # Route controller'ları
│   │   ├── middleware/     # Express middleware'leri
│   │   ├── models/         # Sequelize modelleri
│   │   ├── routes/         # API route tanımları
│   │   ├── services/       # İş mantığı servisleri
│   │   ├── utils/          # Yardımcı fonksiyonlar
│   │   └── app.js          # Express uygulaması
│   ├── package.json
│   └── .env.example
│
├── frontend/               # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/     # React bileşenleri
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context'leri
│   │   ├── services/       # API servisleri
│   │   ├── utils/          # Yardımcı fonksiyonlar
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
│
└── docker-compose.yml      # Docker yapılandırması
```

## 🚀 Kurulum

### Gereksinimler

- Node.js 20+
- PostgreSQL 15+
- Redis (opsiyonel, cache için)

### Backend Kurulumu

```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run dev
```

### Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Kullanıcı Rolleri

| Rol | Yetkiler |
|-----|----------|
| **Müşteri** | Ürün görüntüleme, sepet, sipariş, favoriler |
| **Personel** | Müşteri yetkileri + Satış paneli, kendi logları |
| **Müdür** | Personel yetkileri + Stok onayı, tüm satış logları, personel atama |
| **Yönetici** | Tüm yetkiler + Site yönetimi, animasyon kontrolü, sayfa düzenleme |

## 🎨 Renk Paleti

- **Altın (Primary):** `#D4AF37`
- **Altın Koyu:** `#B8960C`
- **Beyaz:** `#FFFFFF`
- **Soft Gri:** `#F5F5F5`
- **Koyu Gri:** `#333333`

## 📱 API Endpoints

### Auth
- `POST /api/auth/register` - Kayıt
- `POST /api/auth/login` - Giriş
- `POST /api/auth/2fa/setup` - 2FA kurulumu
- `POST /api/auth/2fa/verify` - 2FA doğrulama

### Products
- `GET /api/products` - Ürün listesi
- `GET /api/products/:id` - Ürün detayı
- `POST /api/products` - Ürün ekleme (Admin)
- `PUT /api/products/:id` - Ürün güncelleme (Admin)

### Orders
- `GET /api/orders` - Siparişler
- `POST /api/orders` - Sipariş oluşturma
- `GET /api/orders/:id` - Sipariş detayı

### Payment
- `POST /api/payment/initialize` - Ödeme başlatma
- `POST /api/payment/callback` - İyzico callback

## 🔒 Güvenlik

- CSRF koruması
- XSS koruması (helmet.js)
- SQL Injection koruması (Sequelize ORM)
- Rate limiting
- JWT token tabanlı kimlik doğrulama
- 2FA (Google Authenticator)

## 📄 Lisans

MIT License
