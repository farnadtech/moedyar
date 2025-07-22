import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, Mail, Lock, User, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

export default function RegisterPersonal() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "نام و نام خانوادگی الزامی است";
    }

    if (!formData.email.trim()) {
      newErrors.email = "ایمیل الزامی است";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "فرمت ایمیل صحیح نیست";
    }

    if (!formData.password) {
      newErrors.password = "رمز عبور الزامی است";
    } else if (formData.password.length < 8) {
      newErrors.password = "رمز عبور باید حداقل ۸ کاراکتر باشد";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "تکرار رمز عبور مطابقت ندارد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message
      toast({
        title: "✅ ثبت نام موفق",
        description: "حساب شما با موفقیت ایجاد شد. در حال انتقال به پنل مدیریت...",
      });

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      toast({
        title: "خطا در ثبت نام",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="نام کامل خود را وارد کنید"
                    required
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
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
                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="your-email@example.com"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
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
                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="حداقل ۸ کاراکتر"
                    required
                    minLength={8}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
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
                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="رمز عبور را مجدداً وارد کنید"
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
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

              <Button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    در حال ایجاد حساب...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 ml-1" />
                    ایجاد حساب رایگان
                  </>
                )}
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
