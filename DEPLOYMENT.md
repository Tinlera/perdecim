# 🚀 Perdecim VDS Deployment Rehberi

Bu rehber, Perdecim'i Ubuntu Server 24.04 VDS'e deploy etmek ve otomatik güncelleme sistemini kurmak için hazırlanmıştır.

## 📋 Gereksinimler

- Ubuntu Server 24.04
- Minimum 2GB RAM
- Minimum 20GB Disk
- Domain adı (opsiyonel ama önerilir)

---

## 🔧 İlk Kurulum

### 1. Sunucuya Bağlanma

```bash
ssh root@SUNUCU_IP
```

### 2. Yeni Kullanıcı Oluşturma (Önerilir)

```bash
# Yeni kullanıcı oluştur
adduser deploy

# Sudo yetkisi ver
usermod -aG sudo deploy

# Kullanıcıya geç
su - deploy
```

### 3. Kurulum Script'ini Çalıştırma

```bash
# Script'i indir ve çalıştır
curl -fsSL https://raw.githubusercontent.com/Tinlera/perdecim/main/scripts/setup-server.sh | bash
```

Veya manuel olarak:

```bash
# Gerekli paketleri yükle
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git

# Projeyi klonla
sudo mkdir -p /var/www/perdecim
sudo chown -R $USER:$USER /var/www/perdecim
cd /var/www/perdecim
git clone https://github.com/Tinlera/perdecim.git .
```

### 4. Environment Dosyalarını Düzenleme

```bash
# Backend .env
cp backend/env.example.txt backend/.env
nano backend/.env
```

**Backend .env örneği:**
```env
NODE_ENV=production
PORT=5000

# Database
DB_HOST=db
DB_PORT=5432
DB_NAME=perdecim
DB_USER=perdecim
DB_PASSWORD=GucluBirSifre123!

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=cok-uzun-ve-gizli-bir-anahtar-min-32-karakter
JWT_REFRESH_SECRET=baska-bir-cok-uzun-gizli-anahtar-min-32

# Frontend URL
FRONTEND_URL=https://perdecim.com

# İyzico (Production)
IYZICO_API_KEY=your-production-api-key
IYZICO_SECRET_KEY=your-production-secret-key
IYZICO_BASE_URL=https://api.iyzipay.com
```

```bash
# Frontend .env
cp frontend/env.example.txt frontend/.env
nano frontend/.env
```

**Frontend .env örneği:**
```env
VITE_API_URL=https://api.perdecim.com/api
VITE_SITE_NAME=Perdecim
```

### 5. Docker'ı Başlatma

```bash
cd /var/www/perdecim
docker-compose up -d
```

### 6. Durumu Kontrol Etme

```bash
docker-compose ps
docker-compose logs -f
```

---

## 🔄 Otomatik Güncelleme Kurulumu (GitHub Actions)

GitHub'a her push yaptığınızda sunucu otomatik güncellensin istiyorsanız:

### 1. SSH Key Oluşturma (Sunucuda)

```bash
# Deploy kullanıcısı olarak
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy -N ""

# Public key'i authorized_keys'e ekle
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# Private key'i görüntüle (bunu kopyalayacaksınız)
cat ~/.ssh/github_deploy
```

### 2. GitHub Secrets Ekleme

GitHub repo'nuzda: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Aşağıdaki secret'ları ekleyin:

| Secret Name | Değer |
|-------------|-------|
| `VDS_HOST` | Sunucu IP adresi (örn: `185.123.45.67`) |
| `VDS_USERNAME` | SSH kullanıcı adı (örn: `deploy`) |
| `VDS_SSH_KEY` | SSH private key (yukarıda oluşturduğunuz) |
| `VDS_PORT` | SSH port (genellikle `22`) |

### 3. Test Etme

Herhangi bir değişiklik yapıp push edin:

```bash
git add .
git commit -m "test: deployment test"
git push origin main
```

GitHub Actions sekmesinden deployment'ı takip edebilirsiniz.

---

## 🌐 Domain ve SSL Kurulumu

### 1. Domain DNS Ayarları

Domain sağlayıcınızda A kaydı ekleyin:
- `@` → Sunucu IP'si
- `www` → Sunucu IP'si
- `api` → Sunucu IP'si (API için subdomain kullanıyorsanız)

### 2. Nginx Reverse Proxy (Opsiyonel)

Sunucuda direkt Nginx kullanmak isterseniz:

```bash
sudo apt install nginx certbot python3-certbot-nginx

# Nginx config
sudo nano /etc/nginx/sites-available/perdecim
```

```nginx
server {
    listen 80;
    server_name perdecim.com www.perdecim.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.perdecim.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Etkinleştir
sudo ln -s /etc/nginx/sites-available/perdecim /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL sertifikası al
sudo certbot --nginx -d perdecim.com -d www.perdecim.com -d api.perdecim.com
```

---

## 🛠️ Faydalı Komutlar

### Docker Komutları

```bash
# Container'ları görüntüle
docker-compose ps

# Logları görüntüle
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Container'ları yeniden başlat
docker-compose restart

# Container'ları durdur
docker-compose down

# Container'ları başlat (build ile)
docker-compose up -d --build

# Tüm container'ları temizle
docker-compose down -v --rmi all
```

### Manuel Güncelleme

```bash
cd /var/www/perdecim
./scripts/update.sh
```

Veya:

```bash
cd /var/www/perdecim
git pull origin main
docker-compose down
docker-compose up -d --build
```

### Database Yedekleme

```bash
# Yedek al
docker-compose exec db pg_dump -U perdecim perdecim > backup_$(date +%Y%m%d).sql

# Yedekten geri yükle
docker-compose exec -T db psql -U perdecim perdecim < backup_20240101.sql
```

---

## 🔍 Sorun Giderme

### Container başlamıyor

```bash
# Logları kontrol et
docker-compose logs backend
docker-compose logs frontend

# Container'a bağlan
docker-compose exec backend sh
```

### Port çakışması

```bash
# Portları kontrol et
sudo netstat -tlnp | grep -E ':(80|443|3000|5000)'

# Çakışan servisi durdur
sudo systemctl stop nginx
```

### Disk doldu

```bash
# Docker temizliği
docker system prune -a -f

# Log dosyalarını temizle
sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

### GitHub Actions başarısız

1. Secrets'ların doğru girildiğinden emin olun
2. SSH key'in authorized_keys'e eklendiğini kontrol edin
3. Sunucu firewall'ında SSH port'unun açık olduğunu kontrol edin

```bash
# SSH bağlantısını test et
ssh -i ~/.ssh/github_deploy deploy@SUNUCU_IP
```

---

## 📊 İzleme ve Bakım

### Sistem Kaynaklarını İzleme

```bash
# Anlık durum
htop

# Docker stats
docker stats

# Disk kullanımı
df -h
```

### Otomatik Yedekleme (Cron)

```bash
# Crontab düzenle
crontab -e

# Her gün saat 03:00'te yedek al
0 3 * * * cd /var/www/perdecim && docker-compose exec -T db pg_dump -U perdecim perdecim > /var/backups/perdecim_$(date +\%Y\%m\%d).sql

# 7 günden eski yedekleri sil
0 4 * * * find /var/backups -name "perdecim_*.sql" -mtime +7 -delete
```

---

## 📞 Destek

Sorun yaşarsanız GitHub Issues üzerinden bildirebilirsiniz.
