# رویداد یار (Moedyar)

سیستم مدیریت رویدادها و یادآوری‌ها با پشتیبانی از تقویم شمسی

## ویژگی‌ها

- ✅ مدیریت رویدادها با تقویم شمسی
- ✅ سیستم یادآوری هوشمند
- ✅ احراز هویت کامل
- ✅ پنل مدیریت
- ✅ رابط کاربری مدرن و ریسپانسیو
- ✅ پشتیبانی از تیم‌ها
- ✅ گزارش‌گیری پیشرفته

## نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+
- npm یا yarn

### مراحل نصب

1. کلون کردن پروژه:
```bash
git clone https://github.com/farnadtech/moedyar.git
cd moedyar
```

2. نصب وابستگی‌ها:
```bash
npm install
```

3. تنظیم متغیرهای محیطی:
```bash
cp .env.example .env
```
سپس فایل `.env` را ویرایش کنید.

4. راه‌اندازی دیتابیس:
```bash
npx prisma generate
npx prisma db push
```

5. اجرای پروژه:
```bash
npm run dev
```

## Deploy روی Netlify

### روش اول: از طریق GitHub (توصیه شده)

1. پروژه را روی GitHub push کنید
2. به [Netlify](https://netlify.com) بروید و وارد شوید
3. "New site from Git" را انتخاب کنید
4. مخزن GitHub خود را انتخاب کنید
5. تنظیمات build:
   - Build command: `npm run build:client`
   - Publish directory: `dist/spa`
   - Functions directory: `netlify/functions`

### روش دوم: از طریق Netlify CLI

```bash
# نصب Netlify CLI
npm install -g netlify-cli

# ورود به Netlify
netlify login

# Deploy پروژه
netlify deploy --prod
```

### تنظیم متغیرهای محیطی در Netlify

1. در پنل Netlify به Site settings > Environment variables بروید
2. متغیرهای زیر را اضافه کنید:
   - `DATABASE_URL`: آدرس دیتابیس (برای production از PostgreSQL استفاده کنید)
   - `JWT_SECRET`: کلید مخفی JWT
   - `EMAIL_USER`: ایمیل برای ارسال نوتیفیکیشن
   - `EMAIL_PASS`: رمز عبور ایمیل
   - `APP_URL`: آدرس سایت شما
   - سایر متغیرهای موجود در `.env.example`

## ساختار پروژه

```
├── client/          # فرانت‌اند React
├── server/          # بک‌اند Express
├── prisma/          # اسکیما دیتابیس
├── netlify/         # تنظیمات Netlify
└── shared/          # کدهای مشترک
```

## تکنولوژی‌های استفاده شده

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: JWT
- **Deployment**: Netlify

## مشارکت

برای مشارکت در پروژه:

1. Fork کنید
2. برنچ جدید بسازید (`git checkout -b feature/amazing-feature`)
3. تغییرات را commit کنید (`git commit -m 'Add amazing feature'`)
4. Push کنید (`git push origin feature/amazing-feature`)
5. Pull Request ایجاد کنید

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## پشتیبانی

برای گزارش باگ یا درخواست ویژگی جدید، لطفاً از بخش Issues استفاده کنید.