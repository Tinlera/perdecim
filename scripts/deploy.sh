#!/bin/bash

# ============================================
# Perdecim E-Commerce - VDS Deployment Script
# Ubuntu Server 24.04 için
# ============================================

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║     Perdecim E-Commerce Deployment         ║"
echo "║     Ubuntu Server 24.04                    ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# Domain adı
read -p "Domain adınızı girin (örn: perdecim.com): " DOMAIN
read -p "Email adresinizi girin (SSL için): " EMAIL

# Değişkenler
APP_DIR="/var/www/perdecim"
REPO_URL="https://github.com/YOUR_USERNAME/perdecim.git"  # Kendi repo URL'nizi girin

# 1. Sistem Güncellemesi
echo -e "${YELLOW}[1/10] Sistem güncelleniyor...${NC}"
sudo apt update && sudo apt upgrade -y

# 2. Gerekli Paketler
echo -e "${YELLOW}[2/10] Gerekli paketler yükleniyor...${NC}"
sudo apt install -y \
    curl \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban

# 3. Docker Kurulumu
echo -e "${YELLOW}[3/10] Docker kuruluyor...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Docker Compose
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 4. Firewall Ayarları
echo -e "${YELLOW}[4/10] Firewall ayarlanıyor...${NC}"
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# 5. Fail2ban Ayarları
echo -e "${YELLOW}[5/10] Fail2ban ayarlanıyor...${NC}"
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# 6. Proje Dizini
echo -e "${YELLOW}[6/10] Proje dizini oluşturuluyor...${NC}"
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# 7. Proje Klonlama (veya kopyalama)
echo -e "${YELLOW}[7/10] Proje dosyaları kopyalanıyor...${NC}"
if [ -d ".git" ]; then
    # Git repo ise
    cd $APP_DIR
    git clone $REPO_URL . || git pull origin main
else
    # Manuel kopyalama
    echo "Proje dosyalarını $APP_DIR dizinine kopyalayın"
    echo "Örnek: scp -r ./* user@server:$APP_DIR/"
fi

# 8. Environment Dosyaları
echo -e "${YELLOW}[8/10] Environment dosyaları oluşturuluyor...${NC}"

# JWT Secret oluştur
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d '\n')

cat > $APP_DIR/.env << EOF
# Server
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://$DOMAIN

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=perdecim
DB_USER=perdecim_user
DB_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=30d

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Iyzico (Sandbox - Production'da gerçek key'leri girin)
IYZICO_API_KEY=sandbox-your_api_key
IYZICO_SECRET_KEY=sandbox-your_secret_key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# 2FA
TWO_FA_APP_NAME=Perdecim

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
EOF

echo -e "${GREEN}Environment dosyası oluşturuldu: $APP_DIR/.env${NC}"
echo -e "${RED}ÖNEMLİ: .env dosyasındaki Iyzico API key'lerini güncelleyin!${NC}"

# 9. SSL Sertifikası
echo -e "${YELLOW}[9/10] SSL sertifikası alınıyor...${NC}"

# Geçici nginx config
sudo tee /etc/nginx/sites-available/$DOMAIN << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo mkdir -p /var/www/certbot
sudo nginx -t && sudo systemctl reload nginx

# SSL al
sudo certbot certonly --webroot -w /var/www/certbot -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# SSL sertifikalarını kopyala
sudo mkdir -p $APP_DIR/nginx/ssl
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $APP_DIR/nginx/ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $APP_DIR/nginx/ssl/
sudo chown -R $USER:$USER $APP_DIR/nginx/ssl

# 10. Docker Compose ile Başlat
echo -e "${YELLOW}[10/10] Uygulama başlatılıyor...${NC}"
cd $APP_DIR

# Build ve başlat
docker-compose build --no-cache
docker-compose up -d

# Veritabanı seed
echo -e "${YELLOW}Veritabanı seed ediliyor...${NC}"
sleep 10  # DB'nin hazır olmasını bekle
docker-compose exec backend node src/seeders/initial.js

# SSL otomatik yenileme
echo -e "${YELLOW}SSL otomatik yenileme ayarlanıyor...${NC}"
(crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/*.pem $APP_DIR/nginx/ssl/ && docker-compose -f $APP_DIR/docker-compose.yml restart frontend") | crontab -

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║     Deployment Tamamlandı! 🎉              ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

echo ""
echo -e "${GREEN}Site Adresi:${NC} https://$DOMAIN"
echo ""
echo -e "${GREEN}Admin Girişi:${NC}"
echo "  Email: admin@perdecim.com"
echo "  Şifre: Admin123!"
echo ""
echo -e "${RED}ÖNEMLİ:${NC}"
echo "1. Admin şifresini hemen değiştirin!"
echo "2. .env dosyasındaki Iyzico API key'lerini güncelleyin"
echo "3. 2FA'yı aktifleştirin"
echo ""
echo -e "${YELLOW}Yararlı Komutlar:${NC}"
echo "  docker-compose logs -f        # Logları izle"
echo "  docker-compose restart        # Yeniden başlat"
echo "  docker-compose down           # Durdur"
echo "  docker-compose up -d          # Başlat"
echo ""
