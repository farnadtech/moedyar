import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, Mail, Lock, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function RegisterPersonal() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration logic
    console.log("Registration data:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 text-brand-600 hover:text-brand-700">
            <ArrowRight className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">رویداد یار</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ایجاد حساب شخصی</h1>
          <p className="text-gray-600">شروع رایگان با ۳ رویداد</p>
        </div>

        <Card className="border-2 border-brand-100">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">ثبت نام رایگان</CardTitle>
            <CardDescription>
              فقط چند قدم تا مدیریت هوشمند رویدادهایتان
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام و نام خانوادگی
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="نام کامل خود را وارد کنید"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ایمیل
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="your-email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز عبور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="حداقل ۸ کاراکتر"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تکرار رمز عبور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="رمز عبور را مجدداً وارد کنید"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  با <Link to="/terms" className="text-brand-600 hover:text-brand-700">شرایط استفاده</Link> و{" "}
                  <Link to="/privacy" className="text-brand-600 hover:text-brand-700">حریم خصوصی</Link> موافقم
                </label>
              </div>

              <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 py-3">
                ایجاد حساب رایگان
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                قبلاً حساب دارید؟{" "}
                <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
                  وارد شوید
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link to="/register/business" className="text-sm text-gray-500 hover:text-gray-700">
                نیاز به حساب کسب‌وکار دارید؟
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Benefits reminder */}
        <div className="mt-6 bg-brand-50 border border-brand-200 rounded-lg p-4">
          <h3 className="font-medium text-brand-900 mb-2">مزایای حساب رایگان شما:</h3>
          <ul className="text-sm text-brand-700 space-y-1">
            <li>• ثبت تا ۳ رویداد</li>
            <li>• یادآوری از طریق ایمیل</li>
            <li>• پشتیبانی رایگان</li>
            <li>• ارتقا آسان به پرمیوم</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
