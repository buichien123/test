#!/bin/bash

# Script to setup SSL certificates with Let's Encrypt
# Usage: ./setup-ssl.sh your-email@example.com

set -e

EMAIL=$1

if [ -z "$EMAIL" ]; then
    echo "❌ Error: Email is required"
    echo "Usage: ./setup-ssl.sh your-email@example.com"
    exit 1
fi

echo "🚀 Setting up SSL certificates for techstorehust.click and techstorehust.site"
echo "📧 Email: $EMAIL"
echo ""

# Make sure nginx is running
echo "📦 Checking nginx..."
docker compose ps nginx | grep -q "Up" || docker compose up -d nginx

# Wait for nginx to be ready
echo "⏳ Waiting for nginx to be ready..."
sleep 3

# Request certificate for backend domain
echo ""
echo "🔐 Requesting SSL certificate for techstorehust.click..."
if docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d techstorehust.click \
    -d www.techstorehust.click; then
    echo "✅ Certificate obtained for techstorehust.click"
else
    echo "⚠️  Failed to get certificate for techstorehust.click"
    echo "   Make sure the domain is pointing to this server's IP"
    echo "   Check DNS: nslookup techstorehust.click"
    exit 1
fi

# Request certificate for frontend domain
echo ""
echo "🔐 Requesting SSL certificate for techstorehust.site..."
if docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d techstorehust.site \
    -d www.techstorehust.site; then
    echo "✅ Certificate obtained for techstorehust.site"
else
    echo "⚠️  Failed to get certificate for techstorehust.site"
    echo "   Make sure the domain is pointing to this server's IP"
    echo "   Check DNS: nslookup techstorehust.site"
    exit 1
fi

echo ""
echo "✅ SSL certificates obtained!"
echo "🔄 Updating nginx configuration to enable HTTPS..."

# Uncomment HTTPS blocks in nginx configs
cd /usr/local/project-hust/ecommerce-project-hust

# Update backend.conf
sed -i 's/# server {/server {/g' nginx/conf.d/backend.conf
sed -i 's/#     listen 443/    listen 443/g' nginx/conf.d/backend.conf
sed -i 's/#     server_name/    server_name/g' nginx/conf.d/backend.conf
sed -i 's/#     ssl_certificate/    ssl_certificate/g' nginx/conf.d/backend.conf
sed -i 's/#     ssl_certificate_key/    ssl_certificate_key/g' nginx/conf.d/backend.conf
sed -i 's/#     ssl_protocols/    ssl_protocols/g' nginx/conf.d/backend.conf
sed -i 's/#     ssl_ciphers/    ssl_ciphers/g' nginx/conf.d/backend.conf
sed -i 's/#     ssl_prefer_server_ciphers/    ssl_prefer_server_ciphers/g' nginx/conf.d/backend.conf
sed -i 's/#     ssl_session_cache/    ssl_session_cache/g' nginx/conf.d/backend.conf
sed -i 's/#     ssl_session_timeout/    ssl_session_timeout/g' nginx/conf.d/backend.conf
sed -i 's/#     add_header/    add_header/g' nginx/conf.d/backend.conf
sed -i 's/#     location/    location/g' nginx/conf.d/backend.conf
sed -i 's/#         proxy_pass/        proxy_pass/g' nginx/conf.d/backend.conf
sed -i 's/#         proxy_http_version/        proxy_http_version/g' nginx/conf.d/backend.conf
sed -i 's/#         proxy_set_header/        proxy_set_header/g' nginx/conf.d/backend.conf
sed -i 's/#         proxy_cache_bypass/        proxy_cache_bypass/g' nginx/conf.d/backend.conf
sed -i 's/#         proxy_connect_timeout/        proxy_connect_timeout/g' nginx/conf.d/backend.conf
sed -i 's/#         proxy_send_timeout/        proxy_send_timeout/g' nginx/conf.d/backend.conf
sed -i 's/#         proxy_read_timeout/        proxy_read_timeout/g' nginx/conf.d/backend.conf
sed -i 's/# }/}/g' nginx/conf.d/backend.conf

# Update frontend.conf
sed -i 's/# server {/server {/g' nginx/conf.d/frontend.conf
sed -i 's/#     listen 443/    listen 443/g' nginx/conf.d/frontend.conf
sed -i 's/#     server_name/    server_name/g' nginx/conf.d/frontend.conf
sed -i 's/#     ssl_certificate/    ssl_certificate/g' nginx/conf.d/frontend.conf
sed -i 's/#     ssl_certificate_key/    ssl_certificate_key/g' nginx/conf.d/frontend.conf
sed -i 's/#     ssl_protocols/    ssl_protocols/g' nginx/conf.d/frontend.conf
sed -i 's/#     ssl_ciphers/    ssl_ciphers/g' nginx/conf.d/frontend.conf
sed -i 's/#     ssl_prefer_server_ciphers/    ssl_prefer_server_ciphers/g' nginx/conf.d/frontend.conf
sed -i 's/#     ssl_session_cache/    ssl_session_cache/g' nginx/conf.d/frontend.conf
sed -i 's/#     ssl_session_timeout/    ssl_session_timeout/g' nginx/conf.d/frontend.conf
sed -i 's/#     add_header/    add_header/g' nginx/conf.d/frontend.conf
sed -i 's/#     location/    location/g' nginx/conf.d/frontend.conf
sed -i 's/#         proxy_pass/        proxy_pass/g' nginx/conf.d/frontend.conf
sed -i 's/#         proxy_http_version/        proxy_http_version/g' nginx/conf.d/frontend.conf
sed -i 's/#         proxy_set_header/        proxy_set_header/g' nginx/conf.d/frontend.conf
sed -i 's/#         proxy_cache_bypass/        proxy_cache_bypass/g' nginx/conf.d/frontend.conf
sed -i 's/#         add_header/        add_header/g' nginx/conf.d/frontend.conf
sed -i 's/#         if ($request_method/        if ($request_method/g' nginx/conf.d/frontend.conf
sed -i 's/#             return/            return/g' nginx/conf.d/frontend.conf
sed -i 's/#         }/        }/g' nginx/conf.d/frontend.conf
sed -i 's/# }/}/g' nginx/conf.d/frontend.conf

# Update HTTP blocks to redirect to HTTPS
sed -i 's/# return 301/return 301/g' nginx/conf.d/backend.conf
sed -i 's/# return 301/return 301/g' nginx/conf.d/frontend.conf

# Reload nginx
echo "🔄 Reloading nginx..."
docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload

echo ""
echo "✨ SSL setup complete!"
echo "🌐 Your sites are now accessible via HTTPS:"
echo "   - https://techstorehust.click"
echo "   - https://techstorehust.site"
echo ""
echo "📝 Note: HTTP requests will automatically redirect to HTTPS"

