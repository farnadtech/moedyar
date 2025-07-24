# مؤدیار (Moedyar)

سیستم مدیریت رویدادها و تیم‌ها با قابلیت‌های پیشرفته

## ویژگی‌ها

- 🔐 سیستم احراز هویت کامل
- 📅 مدیریت رویدادها و تقویم
- 👥 مدیریت تیم‌ها و دعوت اعضا
- 💳 سیستم اشتراک و پرداخت
- 🔔 سیستم اطلاع‌رسانی
- 📊 گزارش‌گیری و آمار
- 🎨 رابط کاربری مدرن و ریسپانسیو

## تکنولوژی‌های استفاده شده

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Lucide React Icons

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- SQLite Database
- JWT Authentication
- bcrypt

### پرداخت
- ZarinPal Gateway

## نصب و راه‌اندازی

### پیش‌نیازها
- Node.js (نسخه 18 یا بالاتر)
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
فایل `.env` را ایجاد کرده و متغیرهای زیر را تنظیم کنید:
```env
JWT_SECRET=your-jwt-secret
ZARINPAL_MERCHANT_ID=your-zarinpal-merchant-id
DATABASE_URL="file:./dev.db"
```

4. راه‌اندازی دیتابیس:
```bash
npx prisma migrate dev
npx prisma generate
```

5. ایجاد کاربر ادمین:
```bash
npm run create-admin
```

6. اجرای پروژه:
```bash
npm run dev
```

پروژه در آدرس `http://localhost:5173` در دسترس خواهد بود.

## ساختار پروژه

```
├── client/          # Frontend React App
│   ├── components/  # کامپوننت‌های قابل استفاده مجدد
│   ├── lib/         # کتابخانه‌ها و utilities
│   └── pages/       # صفحات اپلیکیشن
├── server/          # Backend Express Server
│   ├── lib/         # کتابخانه‌ها و utilities
│   ├── routes/      # API routes
│   └── scripts/     # اسکریپت‌های کمکی
├── shared/          # کدهای مشترک
├── prisma/          # Schema و migrations دیتابیس
└── public/          # فایل‌های استاتیک
```

## API Documentation

### Authentication
- `POST /api/auth/register` - ثبت‌نام کاربر جدید
- `POST /api/auth/login` - ورود کاربر
- `POST /api/auth/logout` - خروج کاربر

### Events
- `GET /api/events` - دریافت لیست رویدادها
- `POST /api/events` - ایجاد رویداد جدید
- `PUT /api/events/:id` - ویرایش رویداد
- `DELETE /api/events/:id` - حذف رویداد

### Teams
- `GET /api/teams` - دریافت لیست تیم‌ها
- `POST /api/teams` - ایجاد تیم جدید
- `POST /api/teams/:id/invite` - دعوت عضو به تیم

### Subscriptions
- `POST /api/subscriptions/purchase` - خرید اشتراک
- `POST /api/subscriptions/cancel` - لغو اشتراک

## مشارکت در پروژه

1. Fork کردن پروژه
2. ایجاد branch جدید (`git checkout -b feature/amazing-feature`)
3. Commit کردن تغییرات (`git commit -m 'Add some amazing feature'`)
4. Push کردن به branch (`git push origin feature/amazing-feature`)
5. ایجاد Pull Request

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## تماس

برای سوالات و پیشنهادات می‌توانید با ما تماس بگیرید.