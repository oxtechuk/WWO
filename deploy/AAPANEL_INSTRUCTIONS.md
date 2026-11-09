# 💎 دليل النشر المباشر السريع على aaPanel (بدون Docker)

## 1. التثبيت في متجر aaPanel App Store:
- **Node.js Version Manager** (اختر Node v20 LTS واضغط Set as default مع تفعيل PM2).
- **Nginx** (الإصدار الحديث).
- **Redis** (من App Store واضغط Start).
- **PostgreSQL Manager** أو **MySQL**.

## 2. تجهيز قاعدة البيانات في aaPanel:
- أنشئ قاعدة بيانات باسم `wox_db` ومستخدم `wox_user`.
- ضع بيانات الاتصال في ملف `.env`.

## 3. الأوامر التي تنفذها داخل مجلد المشروع `/www/wwwroot/wox`:
```bash
# 1. تثبيت الحزم
npm install --legacy-peer-deps

# 2. بناء المشروع
npm run build

# 3. إنشاء وتطبيق جداول قاعدة البيانات
export DATABASE_PROVIDER=postgresql # أو mysql
npm run db:deploy

# 4. تشغيل التطبيق عبر PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 4. إعداد الـ Nginx Reverse Proxy في aaPanel:
في إعدادات الدومين > **Reverse Proxy** أضف التالي:
```nginx
client_max_body_size 150m;

location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    proxy_buffering off;
}
```

## 5. تفعيل شهادة SSL:
من إعدادات الدومين في aaPanel > **SSL** > **Let's Encrypt** > Apply ثم فعّل **Force HTTPS**.
