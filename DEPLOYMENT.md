# راهنمای دیپلوی پروژه مؤدیار

## دیپلوی موفقیت‌آمیز

پروژه با موفقیت روی Netlify دیپلوی شده است:

- **URL سایت**: https://moedyar-app.netlify.app
- **پنل مدیریت**: https://app.netlify.com/projects/moedyar-app

## تنظیم متغیرهای محیطی

برای عملکرد کامل پروژه، باید متغیرهای محیطی زیر را در پنل Netlify تنظیم کنید:

### مسیر تنظیمات:
1. وارد پنل مدیریت Netlify شوید
2. به بخش **Site settings** بروید
3. روی **Environment variables** کلیک کنید
4. متغیرهای زیر را اضافه کنید:

### متغیرهای ضروری:

```
DATABASE_URL=file:./dev.db
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=7d
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SMS_USERNAME=your-mellipayamak-username
SMS_PASSWORD=your-mellipayamak-password
SMS_SENDER=50004000123456
ZARINPAL_MERCHANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ZARINPAL_SANDBOX=true
NODE_ENV=production
PORT=8080
APP_URL=https://moedyar-app.netlify.app
APP_NAME=رویداد یار
SUPPORT_EMAIL=support@yourdomain.com
```

### نکات مهم:

1. **JWT_SECRET**: حتماً یک کلید قوی و منحصر به فرد تولید کنید
2. **EMAIL_USER** و **EMAIL_PASS**: اطلاعات ایمیل واقعی خود را وارد کنید
3. **ZARINPAL_MERCHANT_ID**: شناسه درگاه پرداخت زرین‌پال خود را وارد کنید
4. **APP_URL**: آدرس سایت دیپلوی شده را وارد کنید
5. **NODE_ENV**: برای production روی `production` تنظیم کنید

### پس از تنظیم متغیرها:

1. روی **Save** کلیک کنید
2. سایت به طور خودکار rebuild می‌شود
3. تغییرات در چند دقیقه اعمال خواهد شد

## بروزرسانی پروژه

برای بروزرسانی پروژه:

```bash
# تغییرات را کامیت کنید
git add .
git commit -m "Update project"
git push origin main

# یا مستقیماً از Netlify CLI
npm run build
netlify deploy --prod
```

## مشکلات رایج

### اگر سایت لود نمی‌شود:
1. متغیرهای محیطی را بررسی کنید
2. لاگ‌های build را در پنل Netlify چک کنید
3. مطمئن شوید که تمام dependencies نصب شده‌اند

### اگر API کار نمی‌کند:
1. مطمئن شوید که Netlify Functions فعال است
2. مسیر `/api/*` به درستی تنظیم شده باشد
3. متغیرهای محیطی مربوط به دیتابیس را بررسی کنید

## پشتیبانی

در صورت بروز مشکل، می‌توانید:
- لاگ‌های Netlify را بررسی کنید
- از بخش Issues در گیت‌هاب استفاده کنید
- با تیم پشتیبانی تماس بگیرید