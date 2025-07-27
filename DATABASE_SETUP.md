# راهنمای تنظیم دیتابیس PostgreSQL

## مشکل فعلی

پروژه در حال حاضر از دیتابیس SQLite استفاده می‌کند که در محیط Netlify کار نمی‌کند. برای حل این مشکل باید از یک دیتابیس PostgreSQL ابری استفاده کنیم.

## راه‌حل: استفاده از Supabase (رایگان)

### مرحله 1: ایجاد حساب Supabase

1. به سایت [Supabase](https://supabase.com) بروید
2. روی **Start your project** کلیک کنید
3. با GitHub یا ایمیل ثبت‌نام کنید

### مرحله 2: ایجاد پروژه جدید

1. روی **New Project** کلیک کنید
2. نام پروژه را `moedyar-db` بگذارید
3. رمز عبور قوی برای دیتابیس انتخاب کنید
4. منطقه نزدیک به ایران (مثل Frankfurt) انتخاب کنید
5. روی **Create new project** کلیک کنید

### مرحله 3: دریافت Connection String

1. در پنل Supabase، به بخش **Settings** بروید
2. روی **Database** کلیک کنید
3. در بخش **Connection string**، گزینه **URI** را انتخاب کنید
4. رشته اتصال را کپی کنید (مثل زیر):

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

### مرحله 4: تنظیم متغیر محیطی در Netlify

1. وارد پنل Netlify شوید: https://app.netlify.com/projects/moedyar-app
2. به **Site settings** بروید
3. روی **Environment variables** کلیک کنید
4. متغیر جدید اضافه کنید:
   - **Key**: `DATABASE_URL`
   - **Value**: رشته اتصال Supabase که کپی کردید
5. روی **Save** کلیک کنید

### مرحله 5: اجرای Migration

پس از تنظیم DATABASE_URL، باید migration ها را اجرا کنید:

```bash
# نصب Prisma CLI (اگر نصب نیست)
npm install -g prisma

# تولید Prisma Client جدید
npx prisma generate

# اجرای migration ها
npx prisma db push
```

### مرحله 6: دیپلوی مجدد

```bash
# Build و دیپلوی مجدد
npm run build
netlify deploy --prod
```

## تنظیمات اضافی

### ایجاد کاربر ادمین

پس از تنظیم دیتابیس، یک کاربر ادمین ایجاد کنید:

```bash
npx tsx server/scripts/create-admin.ts
```

### بررسی اتصال دیتابیس

برای اطمینان از اتصال صحیح:

```bash
npx prisma studio
```

## نکات مهم

1. **امنیت**: هرگز DATABASE_URL را در کد commit نکنید
2. **Backup**: Supabase به طور خودکار backup می‌گیرد
3. **محدودیت**: نسخه رایگان Supabase تا 500MB فضای ذخیره‌سازی دارد
4. **Performance**: برای بهبود عملکرد، index های مناسب اضافه کنید

## عیب‌یابی

### اگر اتصال برقرار نمی‌شود:

1. رشته اتصال را دوباره بررسی کنید
2. مطمئن شوید که رمز عبور صحیح است
3. فایروال Supabase را بررسی کنید

### اگر migration اجرا نمی‌شود:

1. مطمئن شوید که Prisma CLI نصب است
2. DATABASE_URL را در فایل .env محلی تنظیم کنید
3. دستور `npx prisma db push --force-reset` را امتحان کنید

## مزایای PostgreSQL نسبت به SQLite

- ✅ پشتیبانی کامل در محیط production
- ✅ قابلیت‌های پیشرفته‌تر
- ✅ عملکرد بهتر برای concurrent users
- ✅ پشتیبانی از JSON fields
- ✅ Full-text search

پس از انجام این مراحل، پروژه شما باید به درستی کار کند و کاربران بتوانند ثبت‌نام و وارد شوند.