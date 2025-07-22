import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, Settings, Mail, CreditCard, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminSetup() {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700">
              <ArrowRight className="w-4 h-4" />
              بازگشت به پنل ادمین
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">راهنمای راه‌اندازی</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">راهنمای کامل راه‌اندازی سیستم</h1>
            <p className="text-lg text-gray-600">
              برای فعال‌سازی کامل امکانات سیستم، مراحل زیر را دنبال کنید
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  پیکربندی ایمیل (Gmail SMTP)
                </CardTitle>
                <CardDescription>
                  برای ارسال واقعی ایمیل یادآوری به کاربران
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">⚠️ وضعیت فعلی: حالت دمو</h4>
                    <p className="text-yellow-700 text-sm">
                      در حال حاضر سیستم فقط لاگ می‌کند و ایمیل واقعی ارسال نمی‌کند
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">مراحل فعال‌سازی:</h4>
                    <ol className="space-y-2 text-sm list-decimal list-inside">
                      <li>یک حساب Gmail ایجاد کنید یا از حساب موجود استفاده کنید</li>
                      <li>در Gmail، دو مرحله‌ای را فعال کنید</li>
                      <li>یک App Password ایجاد کنید</li>
                      <li>متغیرهای زیر را در فایل .env سرور تنظیم کنید:</li>
                    </ol>
                    
                    <div className="mt-3 bg-black text-green-400 p-3 rounded text-sm font-mono">
                      EMAIL_USER="your-gmail@gmail.com"<br/>
                      EMAIL_PASS="your-16-character-app-password"
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-600">
                      💡 راهنمای کامل ایجاد App Password در <a href="https://support.google.com/accounts/answer/185833" target="_blank" className="text-blue-600 underline">مستندات Google</a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ZarinPal Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  پیکربندی زرین‌پال
                </CardTitle>
                <CardDescription>
                  برای پذیرش پرداخت واقعی از کاربران
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">ℹ️ وضعیت فعلی: حالت تست</h4>
                    <p className="text-blue-700 text-sm">
                      در حال حاضر سیستم در حالت sandbox کار می‌کند
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">مراحل فعال‌سازی:</h4>
                    <ol className="space-y-2 text-sm list-decimal list-inside">
                      <li>در <a href="https://zarinpal.com" target="_blank" className="text-blue-600 underline">زرین‌پال</a> ثبت‌نام کنید</li>
                      <li>درخواست درگاه پرداخت دهید</li>
                      <li>پس از تایید، Merchant ID دریافت کنید</li>
                      <li>متغیرهای زیر را در .env تنظیم کنید:</li>
                    </ol>
                    
                    <div className="mt-3 bg-black text-green-400 p-3 rounded text-sm font-mono">
                      ZARINPAL_MERCHANT_ID="your-real-merchant-id"<br/>
                      ZARINPAL_SANDBOX="false"
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SMS Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  پیکربندی پیامک (ملی‌پیامک)
                </CardTitle>
                <CardDescription>
                  برای ارسال یادآوری از طریق پیامک
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">مراحل فعال‌سازی:</h4>
                    <ol className="space-y-2 text-sm list-decimal list-inside">
                      <li>در <a href="https://payamak-panel.com" target="_blank" className="text-blue-600 underline">ملی‌پیامک</a> ثبت‌نام کنید</li>
                      <li>خط اختصاصی دریافت کنید</li>
                      <li>اطلاعات زیر را در .env تنظیم کنید:</li>
                    </ol>
                    
                    <div className="mt-3 bg-black text-green-400 p-3 rounded text-sm font-mono">
                      SMS_USERNAME="your-mellipayamak-username"<br/>
                      SMS_PASSWORD="your-mellipayamak-password"<br/>
                      SMS_SENDER="your-sender-number"
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Production Deployment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-red-600" />
                  استقرار در production
                </CardTitle>
                <CardDescription>
                  تنظیمات نهایی برای راه‌اندازی
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">تنظیمات نهایی:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="bg-black text-green-400 p-3 rounded font-mono">
                        NODE_ENV="production"<br/>
                        APP_URL="https://yourdomain.com"<br/>
                        DATABASE_URL="your-production-database"<br/>
                        JWT_SECRET="your-super-secret-key"
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Section */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-900">✅ تست نهایی</CardTitle>
                <CardDescription className="text-green-700">
                  پس از تنظیم همه موارد بالا
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to="/settings">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      تست ارسال ایمیل
                    </Button>
                  </Link>
                  <Link to="/premium">
                    <Button variant="outline" className="w-full border-green-600 text-green-600">
                      تست درگاه پرداخت
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
