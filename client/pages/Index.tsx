import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Calendar, Bell, Smartphone, Mail, Zap, Star, Users, Building, User } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white" dir="rtl">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">رویداد یار</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                ورود
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-brand-600 hover:bg-brand-700">
                ثبت نام رایگان
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            هیچ رویداد مهمی را
            <span className="text-brand-600 block">فراموش نکنید</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            سیستم هوشمند یادآوری رویدادها برای کسب‌وکارها و افراد. از تاریخ چک تا تولد، از بیمه تا قراردادها - همه چیز در یک مکان.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register/personal">
              <Button size="lg" className="bg-brand-600 hover:bg-brand-700 text-lg px-8 py-6">
                <User className="ml-2 h-5 w-5" />
                شروع رایگان - حساب شخصی
              </Button>
            </Link>
            <Link to="/register/business">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Building className="ml-2 h-5 w-5" />
                حساب کسب‌وکار
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">چرا رویداد یار؟</h2>
          <p className="text-lg text-gray-600">راه حل کاملی برای مدیریت تمام رویدادهای مهم شما</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center border-2 hover:border-brand-200 transition-colors">
            <CardHeader>
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-brand-600" />
              </div>
              <CardTitle className="text-xl">ثبت آسان رویدادها</CardTitle>
              <CardDescription className="text-base">
                تاریخ چک، تولد، بیمه، قرارداد و هر رویداد مهم دیگری را با چند کلیک ثبت کنید
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center border-2 hover:border-brand-200 transition-colors">
            <CardHeader>
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-brand-600" />
              </div>
              <CardTitle className="text-xl">یادآوری هوشمند</CardTitle>
              <CardDescription className="text-base">
                یادآوری‌های چندگانه در بازه‌های زمانی مختلف برای اطمینان از عدم فراموشی
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center border-2 hover:border-brand-200 transition-colors">
            <CardHeader>
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-brand-600" />
              </div>
              <CardTitle className="text-xl">چندین کانال ارتباطی</CardTitle>
              <CardDescription className="text-base">
                ایمیل، پیامک و واتس‌اپ - شما انتخاب کنید چطور مطلع شوید
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">پکیج‌های حساب شخصی</h2>
          <p className="text-lg text-gray-600">بسته مناسب برای نیازهای شما را انتخاب کنید</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2 hover:border-brand-200 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">رایگان</CardTitle>
              <div className="text-4xl font-bold text-brand-600">۰ تومان</div>
              <CardDescription>برای شروع و آزمایش سیستم</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>تا ۳ رویداد</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>یادآوری از طریق ایمیل</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>پشتیبانی پایه</span>
                </li>
              </ul>
              <Link to="/register/personal" className="block mt-6">
                <Button className="w-full bg-brand-600 hover:bg-brand-700">
                  شروع رایگان
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-brand-500 relative hover:border-brand-600 transition-colors">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-brand-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                پیشنهاد ویژه
              </span>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">پرمیوم</CardTitle>
              <div className="text-4xl font-bold text-brand-600">۴۹,۰۰۰ تومان</div>
              <CardDescription>ماهانه - لغو آسان</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>رویدادهای نامحدود</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>یادآوری ایمیل</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>یادآوری پیامک</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>یادآوری واتس‌اپ</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>پشتیبانی اولویت‌دار</span>
                </li>
              </ul>
              <Link to="/register/personal" className="block mt-6">
                <Button className="w-full bg-brand-600 hover:bg-brand-700">
                  <Star className="ml-2 h-4 w-4" />
                  شروع آزمایشی ۷ روزه
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Business Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">حساب کسب‌وکار</h2>
          <p className="text-xl mb-6 opacity-90">
            راه‌حل تخصصی برای شرکت‌ها و سازمان‌ها با قابلیت‌های پیشرفته مدیریت تیم
          </p>
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>مدیریت تیم</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>تقویم مشترک</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <span>گزارش‌گیری</span>
            </div>
          </div>
          <Link to="/register/business">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              اطلاعات بیشتر و قیمت‌گذاری
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact/Demo */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">آماده شروع هستید؟</h2>
          <p className="text-lg text-gray-600 mb-8">
            همین امروز رویداد یار را امتحان کنید و هیچ رویداد مهمی را فراموش نکنید
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/demo">
              <Button variant="outline" size="lg" className="text-lg px-8">
                مشاهده دمو
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="text-lg px-8">
                تماس با ما
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">رویداد یار</span>
            </div>
            <p className="text-gray-400 mb-6">مدیریت هوشمند رویدادها و یادآوری‌ها</p>
            <div className="flex justify-center gap-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                حریم خصوصی
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                شرایط استفاده
              </Link>
              <Link to="/support" className="text-gray-400 hover:text-white transition-colors">
                پشتیبانی
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center">
              <p className="text-gray-400">
                © ۱۴۰۳ رویداد یار. تمامی حقوق محفوظ است.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
