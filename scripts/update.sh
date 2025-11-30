#!/bin/bash

# ===========================================
# PERDECIM GÜNCELLEME SCRIPTİ
# Bu script sunucuda manuel güncelleme için kullanılır
# ===========================================

set -e

cd /var/www/perdecim

echo "📥 Güncellemeler çekiliyor..."
git fetch origin main
git reset --hard origin/main

echo "🔄 Docker container'ları yeniden başlatılıyor..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "🧹 Eski image'lar temizleniyor..."
docker image prune -f

echo "✅ Güncelleme tamamlandı!"
docker-compose ps

