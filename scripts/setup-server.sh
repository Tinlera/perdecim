#!/bin/bash

# ===========================================
# PERDECIM VDS KURULUM SCRIPTİ
# Ubuntu Server 24.04
# ===========================================

set -e

echo "🚀 Perdecim VDS Kurulumu Başlıyor..."

# Renk tanımlamaları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ===========================================
# 1. SİSTEM GÜNCELLEMESİ
# ===========================================
echo -e "${YELLOW}📦 Sistem güncelleniyor...${NC}"
sudo apt update && sudo apt upgrade -y

# ===========================================
# 2. GEREKLİ PAKETLER
# ===========================================
echo -e "${YELLOW}📦 Gerekli paketler yükleniyor...${NC}"
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    fail2ban

# ===========================================
# 3. DOCKER KURULUMU
# ===========================================
echo -e "${YELLOW}🐳 Docker kuruluyor...${NC}"

# Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker kurulumu
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Docker Compose (standalone)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Kullanıcıyı docker grubuna ekle
sudo usermod -aG docker $USER

echo -e "${GREEN}✅ Docker kuruldu: $(docker --version)${NC}"

# ===========================================
# 4. PROJE DİZİNİ OLUŞTURMA
# ===========================================
echo -e "${YELLOW}📁 Proje dizini oluşturuluyor...${NC}"
sudo mkdir -p /var/www/perdecim
sudo chown -R $USER:$USER /var/www/perdecim

# ===========================================
# 5. GIT REPO KLONLAMA
# ===========================================
echo -e "${YELLOW}📥 GitHub repository klonlanıyor...${NC}"
cd /var/www/perdecim

if [ -d ".git" ]; then
    echo "Repository zaten mevcut, güncelleniyor..."
    git fetch origin main
    git reset --hard origin/main
else
    git clone https://github.com/Tinlera/perdecim.git .
fi

# ===========================================
# 6. ENVIRONMENT DOSYALARI
# ===========================================
echo -e "${YELLOW}⚙️ Environment dosyaları oluşturuluyor...${NC}"

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/env.example.txt backend/.env
    echo -e "${YELLOW}⚠️  backend/.env dosyasını düzenlemeyi unutmayın!${NC}"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cp frontend/env.example.txt frontend/.env
    echo -e "${YELLOW}⚠️  frontend/.env dosyasını düzenlemeyi unutmayın!${NC}"
fi

# ===========================================
# 7. FIREWALL AYARLARI
# ===========================================
echo -e "${YELLOW}🔥 Firewall ayarlanıyor...${NC}"
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# ===========================================
# 8. FAIL2BAN AYARLARI
# ===========================================
echo -e "${YELLOW}🛡️ Fail2ban ayarlanıyor...${NC}"
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# ===========================================
# TAMAMLANDI
# ===========================================
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✅ KURULUM TAMAMLANDI!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "Sonraki adımlar:"
echo -e "1. ${YELLOW}backend/.env${NC} dosyasını düzenleyin"
echo -e "2. ${YELLOW}frontend/.env${NC} dosyasını düzenleyin"
echo -e "3. Docker'ı başlatın: ${YELLOW}cd /var/www/perdecim && docker-compose up -d${NC}"
echo ""
echo -e "GitHub Actions için secrets ekleyin:"
echo -e "  - VDS_HOST: Sunucu IP adresi"
echo -e "  - VDS_USERNAME: SSH kullanıcı adı"
echo -e "  - VDS_SSH_KEY: SSH private key"
echo -e "  - VDS_PORT: SSH port (varsayılan: 22)"
echo ""

