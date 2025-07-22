import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log("Login data:", formData);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ورود به حساب</h1>
          <p className="text-gray-600">به پنل مدیریت رویدادهایتان بروید</p>
        </div>

        <Card className="border-2 border-brand-100">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">خوش آمدید</CardTitle>
            <CardDescription>
              اطلاعات حساب خود را وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="رمز عبور خود را وارد کنید"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600">
                    مرا به خاطر بسپار
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-brand-600 hover:text-brand-700">
                  فراموشی رمز عبور؟
                </Link>
              </div>

              <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 py-3">
                ورود به حساب
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                حساب ندارید؟{" "}
                <Link to="/register" className="text-brand-600 hover:text-brand-700 font-medium">
                  ثبت نام کنید
                </Link>
              </p>
            </div>

            <div className="mt-4 flex gap-2 justify-center">
              <Link to="/register/personal">
                <Button variant="outline" size="sm">
                  حساب شخصی
                </Button>
              </Link>
              <Link to="/register/business">
                <Button variant="outline" size="sm">
                  حساب کسب‌وکار
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick links */}
        <div className="mt-6 text-center space-y-2">
          <Link to="/demo" className="block text-sm text-gray-500 hover:text-gray-700">
            مشاهده دمو سیستم
          </Link>
          <Link to="/support" className="block text-sm text-gray-500 hover:text-gray-700">
            نیاز به کمک دارید؟
          </Link>
        </div>
      </div>
    </div>
  );
}
