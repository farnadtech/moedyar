# راهنمای تنظیم دیتابیس PostgreSQL

## مشکل فعلی

پروژه در حال حاضر از دیتابیس SQLite استفاده می‌کند که در محیط Netlify کار نمی‌کند. برای حل این مشکل باید از یک دیتابیس PostgreSQL ابری استفاده کنیم.

## راه‌حل‌های مختلف برای دیتابیس PostgreSQL

چندین گزینه رایگان برای میزبانی دیتابیس PostgreSQL وجود دارد. در ادامه بهترین گزینه‌ها را معرفی می‌کنیم:

## گزینه 1: Neon (توصیه شده - پایدار و رایگان)

Neon یکی از بهترین و پایدارترین گزینه‌های رایگان برای PostgreSQL است که عملکرد عالی دارد.

### مزایای Neon:
- ✅ PostgreSQL کامل و سازگار 100%
- ✅ رایگان تا 3GB فضای ذخیره‌سازی
- ✅ عملکرد بسیار خوب
- ✅ پشتیبانی از database branching
- ✅ راه‌اندازی آسان و سریع
- ✅ پشتیبانی عالی از Prisma

### راه‌اندازی Neon (مرحله به مرحله):

#### مرحله 1: ایجاد حساب
1. به سایت [Neon](https://neon.tech) بروید
2. روی **Sign Up** کلیک کنید
3. با GitHub ثبت‌نام کنید (سریع‌تر و آسان‌تر)

#### مرحله 2: ایجاد پروژه
1. روی **Create a project** کلیک کنید
2. نام پروژه: `moedyar-database`
3. منطقه: **AWS / Europe (Frankfurt)** (نزدیک‌ترین به ایران)
4. PostgreSQL version: **16** (جدیدترین)
5. روی **Create project** کلیک کنید

#### مرحله 3: دریافت Connection String
1. پس از ایجاد پروژه، به صفحه Dashboard بروید
2. در بخش **Connection Details** روی **Pooled connection** کلیک کنید
3. Connection string را کپی کنید (مثل زیر):

```
postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

## گزینه 2: Railway (ساده و قدرتمند)

Railway یک پلتفرم ساده برای دیپلوی و میزبانی دیتابیس است.

### مزایای Railway:
- ✅ $5 اعتبار رایگان ماهانه
- ✅ راه‌اندازی بسیار آسان
- ✅ PostgreSQL کامل
- ✅ پشتیبانی عالی
- ✅ UI بسیار ساده و کاربرپسند

### راه‌اندازی Railway:

1. به سایت [Railway](https://railway.app) بروید
2. با GitHub ثبت‌نام کنید
3. "New Project" > "Provision PostgreSQL" را انتخاب کنید
4. Connection String را از تب "Connect" کپی کنید

## گزینه 3: Netlify DB (در حال توسعه)

Netlify اخیراً سرویس Netlify DB را معرفی کرده اما هنوز در مرحله بتا است و ممکن است مشکلاتی داشته باشد.

### وضعیت فعلی:
- ⚠️ در مرحله بتا
- ⚠️ ممکن است مشکلات اتصال داشته باشد
- ⚠️ هنوز کاملاً پایدار نیست

### اگر می‌خواهید امتحان کنید:
```bash
npm install -g netlify-cli
npx netlify db init --no-boilerplate
```

## گزینه 4: Supabase (اگر مشکل حل شود)

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

## توصیه نهایی

**بهترین گزینه**: **Neon** - پایدار، رایگان، و عملکرد عالی

**گزینه دوم**: **Railway** - ساده و کاربرپسند

**گزینه سوم**: **Supabase** - اگر مشکلات اتصال حل شود

**توجه**: Netlify DB هنوز در مرحله بتا است و توصیه نمی‌شود.

## مراحل نهایی راه‌اندازی (برای هر دیتابیس)

### مرحله 1: تنظیم متغیر محیطی در Netlify

1. وارد پنل Netlify شوید: https://app.netlify.com/projects/moedyar-app
2. به **Site settings** بروید
3. روی **Environment variables** کلیک کنید
4. متغیر جدید اضافه کنید:
   - **Key**: `DATABASE_URL`
   - **Value**: رشته اتصال دیتابیس که کپی کردید
5. روی **Save** کلیک کنید

### مرحله 2: تنظیم محلی (اختیاری)

برای تست محلی، فایل `.env` ایجاد کنید:

```bash
# ایجاد فایل .env
echo "DATABASE_URL=your_connection_string_here" > .env
```

**توجه**: فایل `.env` را هرگز commit نکنید!

### مرحله 3: اجرای Migration

پس از تنظیم DATABASE_URL، باید migration ها را اجرا کنید:

```bash
# تولید Prisma Client جدید
npx prisma generate

# اجرای migration ها روی دیتابیس جدید
npx prisma db push

# بررسی اتصال (اختیاری)
npx prisma studio
```

### مرحله 4: دیپلوی مجدد

```bash
# Build پروژه
npm run build

# دیپلوی روی Netlify
netlify deploy --prod
```

### مرحله 5: تست نهایی

1. به سایت دیپلوی شده بروید: https://moedyar-app.netlify.app
2. سعی کنید ثبت‌نام کنید
3. اگر موفق بود، مشکل حل شده است! 🎉

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