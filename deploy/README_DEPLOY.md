# دليل رفع ونشر Wox WhatsApp Gateway على سيرفر حي (Production Deployment Guide)

يوفر هذا الدليل أسهل وأسرع الطرق لرفع ونشر منصة **Wox WhatsApp Gateway** على أي سيرفر سحابي (VPS) مثل DigitalOcean، Hetzner، Linode، AWS، أو أي سيرفر بنظام **Ubuntu 22.04 / 24.04**.

---

## ⚡ الطريقة الأسرع والأسهل: السكريبت الآلي (Automated 1-Click Script)

لقد قمنا بتجهيز سكريبت تثبيت شامل ومؤتمت بالكامل يقوم بكل شيء بدلاً منك:
- تثبيت Docker و Nginx و Certbot.
- توليد مفاتيح التشفير وكلمات المرور العشوائية بأمان.
- إعداد ملف `.env` للإنتاج.
- تشغيل الحاويات (Wox API + PostgreSQL + Redis).
- إعداد Reverse Proxy وتوليد شهادة **SSL مجانية (HTTPS)**.
- تفعيل الجدار الناري لحماية السيرفر.

### خطوات التشغيل:
1. **وجّه الدومين (DNS):**
   أنشئ سجل `A Record` لدومينك (مثال: `wox.yourdomain.com`) يشير إلى IP السيرفر.
2. **ارفع ملفات المشروع إلى السيرفر:**
   ```bash
   # من جهازك المحلي، ارفع مجلد المشروع أو اسحبه عبر Git:
   scp -r c:\wamp64\www\Wox root@YOUR_SERVER_IP:/var/www/wox
   ```
3. **ادخل للسيرفر عبر SSH وشغّل السكريبت:**
   ```bash
   ssh root@YOUR_SERVER_IP
   cd /var/www/wox
   chmod +x deploy/docker-deploy.sh
   sudo ./deploy/docker-deploy.sh
   ```
4. سيطلب منك السكريبت فقط اسم الدومين وبريدك الإلكتروني، وخلال دقيقتين ستكون المنصة حية ومؤمنة بالكامل!

---

## 🛠️ الطريقة اليدوية عبر Docker Compose

إذا كنت تفضل تنفيذ الخطوات بنفسك خطوة بخطوة:

### 1. تثبيت Docker على السيرفر
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl enable --now docker
```

### 2. تجهيز ملف البيئة `.env`
انسخ ملف `.env.example` وعدل المتغيرات:
```bash
cp env.example .env
nano .env
```
أهم القيم:
```env
SERVER_URL=https://wox.yourdomain.com
AUTHENTICATION_API_KEY=YourSuperSecretKeyHere32Chars!
POSTGRES_USERNAME=wox_user
POSTGRES_PASSWORD=StrongDbPassword123
POSTGRES_DATABASE=wox_database
CACHE_REDIS_ENABLED=true
CACHE_REDIS_URI=redis://evolution-redis:6379/1
```

### 3. تشغيل الحاويات
```bash
docker compose up -d --build
```
للتحقق من سلامة الخدمات:
```bash
docker compose ps
docker compose logs -f api
```

### 4. إعداد Nginx وشهادة SSL
انسخ ملف الإعداد الجاهز:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
sudo cp deploy/nginx-wox.conf /etc/nginx/sites-available/wox
# استبدل wox.yourdomain.com باسم دومينك داخل الملف:
sudo nano /etc/nginx/sites-available/wox

sudo ln -s /etc/nginx/sites-available/wox /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# استخراج شهادة SSL:
sudo certbot --nginx -d wox.yourdomain.com
```

---

## 💻 الطريقة البديلة: السيرفرات التي تعمل بـ aaPanel أو PM2

إذا كان لديك سيرفر مثبت عليه لوحة **aaPanel**:
1. من **App Store** في aaPanel ثبت: **Node.js (v20)**، **PM2**، **Redis**، **MySQL**.
2. أنشئ قاعدة بيانات `wox_whatsapp` ومستخدمها في لوحة MySQL.
3. ارفع المشروع إلى `/www/wwwroot/wox`.
4. انسخ `.env.production.example` إلى `.env` وضع بيانات قاعدة البيانات ورابط السيرفر.
5. نفذ في التيرمينال:
   ```bash
   cd /www/wwwroot/wox
   export DATABASE_PROVIDER=mysql
   npm install
   npm run db:deploy
   npm run build
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```
6. أنشئ موقع جديد في aaPanel لنطاق `wox.yourdomain.com`، فعّل SSL بنقرة واحدة، ثم أضف **Reverse Proxy** يحول إلى `http://127.0.0.1:8080`.

---

## 🔗 ربط الإضافات بعد النشر

بمجرد أن يصبح الرابط `https://wox.yourdomain.com` يعمل:

### 1. في إضافة ووردبريس (Wox WhatsApp Gateway):
- ادخل إلى لوحة تحكم ووردبريس > **Wox WhatsApp** > **Setup Wizard**.
- ضع رابط السيرفر: `https://wox.yourdomain.com`.
- ضع الـ API Key: القيمة التي وضعتها في `AUTHENTICATION_API_KEY`.
- امسح كود الـ QR من شاشة المتصفح.

### 2. في تطبيق لارافيل (oxtech/wox):
- في ملف `.env` الخاص بمشروع لارافيل:
  ```env
  WOX_SERVER_URL=https://wox.yourdomain.com
  WOX_API_KEY=YourSuperSecretKeyHere32Chars!
  WOX_INSTANCE_NAME=default
  ```
- اختبر الاتصال عبر:
  ```bash
  php artisan wox:test 2010XXXXXXXX
  ```
