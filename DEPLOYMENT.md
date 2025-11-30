# 🚀 VDS Deployment Rehberi

Bu rehber, Perdecim e-ticaret sitesini Ubuntu Server 24.04 üzerinde nasıl deploy edeceğinizi adım adım anlatır.

## 📋 Gereksinimler

- Ubuntu Server 24.04 LTS
- Minimum 2GB RAM, 2 vCPU
- Domain adı (DNS ayarları yapılmış)
- SSH erişimi

## 🔧 Adım 1: Sunucuya Bağlanma

```bash
ssh root@SUNUCU_IP_ADRESI
```

## 📦 Adım 2: Sistem Güncellemesi

```bash
apt update && apt upgrade -y
```

## 🐳 Adım 3: Docker Kurulumu

```bash
# Docker kurulumu
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose kurulumu
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Kullanıcıyı docker grubuna ekle
usermod -aG docker $USER
```

## 🔒 Adım 4: Firewall Ayarları

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

## 📁 Adım 5: Proje Dosyalarını Yükleme

### Seçenek A: Git ile (Önerilen)

```bash
# Proje dizini oluştur
mkdir -p /var/www/perdecim
cd /var/www/perdecim

# Git repo'dan çek
git clone https://github.com/YOUR_USERNAME/perdecim.git .
```

### Seçenek B: SCP ile Manuel Yükleme

Kendi bilgisayarınızdan:
```bash
# Tüm dosyaları sunucuya kopyala
scp -r ./* root@SUNUCU_IP:/var/www/perdecim/
```

## ⚙️ Adım 6: Environment Dosyası

```bash
cd /var/www/perdecim

# .env dosyası oluştur
cat > .env << 'EOF'
# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://perdecim.com

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=perdecim
DB_USER=perdecim_user
DB_PASSWORD=GÜÇLÜ_BİR_ŞİFRE_OLUŞTURUN

# JWT (openssl rand -base64 64 ile oluşturun)
JWT_SECRET=BURAYA_UZUN_RASTGELE_STRING
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=BURAYA_BASKA_UZUN_RASTGELE_STRING
JWT_REFRESH_EXPIRES_IN=30d

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Iyzico
IYZICO_API_KEY=your_api_key
IYZICO_SECRET_KEY=your_secret_key
IYZICO_BASE_URL=https://api.iyzipay.com

# 2FA
TWO_FA_APP_NAME=Perdecim

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
EOF
```

**Güvenli key oluşturmak için:**
```bash
openssl rand -base64 64
```

## 🔐 Adım 7: SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kurulumu
apt install certbot -y

# SSL sertifikası al
certbot certonly --standalone -d perdecim.com -d www.perdecim.com --email your@email.com --agree-tos --non-interactive

# Sertifikaları kopyala
mkdir -p /var/www/perdecim/nginx/ssl
cp /etc/letsencrypt/live/perdecim.com/fullchain.pem /var/www/perdecim/nginx/ssl/
cp /etc/letsencrypt/live/perdecim.com/privkey.pem /var/www/perdecim/nginx/ssl/
```

## 🚀 Adım 8: Uygulamayı Başlatma

```bash
cd /var/www/perdecim

# Build ve başlat
docker-compose up -d --build

# Logları kontrol et
docker-compose logs -f
```

## 🌱 Adım 9: Veritabanı Seed

```bash
# İlk verileri yükle (admin kullanıcısı, kategoriler, örnek ürünler)
docker-compose exec backend npm run seed
```

## ✅ Adım 10: Kontrol

Site açılmalı: `https://perdecim.com`

**Admin Girişi:**
- Email: `admin@perdecim.com`
- Şifre: `Admin123!`

⚠️ **İLK İŞ: Admin şifresini değiştirin!**

---

## 📝 Yararlı Komutlar

```bash
# Logları izle
docker-compose logs -f

# Sadece backend logları
docker-compose logs -f backend

# Yeniden başlat
docker-compose restart

# Durdur
docker-compose down

# Tamamen sil ve yeniden başlat
docker-compose down -v
docker-compose up -d --build

# Container'a bağlan
docker-compose exec backend sh
docker-compose exec postgres psql -U perdecim_user -d perdecim
```

## 🔄 SSL Otomatik Yenileme

```bash
# Crontab'a ekle
crontab -e

# Şu satırı ekle (her gün saat 3'te kontrol):
0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/perdecim.com/*.pem /var/www/perdecim/nginx/ssl/ && docker-compose -f /var/www/perdecim/docker-compose.yml restart frontend
```

## 🔧 Sorun Giderme

### Container başlamıyor
```bash
docker-compose logs backend
docker-compose logs postgres
```

### Veritabanı bağlantı hatası
```bash
# Postgres container'ının çalıştığından emin ol
docker-compose ps

# Postgres'e bağlan
docker-compose exec postgres psql -U perdecim_user -d perdecim
```

### Port kullanımda hatası
```bash
# 80 ve 443 portlarını kullanan servisleri bul
lsof -i :80
lsof -i :443

# Nginx'i durdur (eğer sistem nginx'i çalışıyorsa)
systemctl stop nginx
systemctl disable nginx
```

### Disk dolu
```bash
# Docker temizliği
docker system prune -a
```

## 📊 Monitoring (Opsiyonel)

### Basit Monitoring
```bash
# Container durumları
docker stats

# Disk kullanımı
df -h

# Memory kullanımı
free -m
```

### Gelişmiş Monitoring (Opsiyonel)
Portainer, Grafana veya Netdata kurabilirsiniz.

---

## 🔒 Güvenlik Kontrol Listesi

- [ ] Admin şifresi değiştirildi
- [ ] .env dosyasındaki tüm secret'lar güncellendi
- [ ] Iyzico API key'leri production key'leri ile değiştirildi
- [ ] 2FA aktifleştirildi
- [ ] Firewall aktif
- [ ] SSL sertifikası çalışıyor
- [ ] Otomatik SSL yenileme ayarlandı
- [ ] Backup stratejisi belirlendi

## 💾 Backup

```bash
# Veritabanı backup
docker-compose exec postgres pg_dump -U perdecim_user perdecim > backup_$(date +%Y%m%d).sql

# Uploads backup
tar -czvf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/

# Otomatik backup için crontab
0 2 * * * docker-compose -f /var/www/perdecim/docker-compose.yml exec -T postgres pg_dump -U perdecim_user perdecim > /var/backups/perdecim_$(date +\%Y\%m\%d).sql
```

---

## 📞 Destek

Sorun yaşarsanız:
1. Docker loglarını kontrol edin
2. .env dosyasını kontrol edin
3. Firewall ayarlarını kontrol edin
4. DNS ayarlarını kontrol edin
