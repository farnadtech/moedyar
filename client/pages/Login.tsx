import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, ArrowRight, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "ایمیل الزامی است";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "فرمت ایمیل صحیح نیست";
    }

    if (!formData.password) {
      newErrors.password = "رمز عبور الزامی است";
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
      const success = await login(formData.email, formData.password);

      if (success) {
        toast({
          title: "✅ ورود موفق",
          description: "در حال انتقال به داشبورد...",
        });

        // Redirect to dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        toast({
          title: "خطا در ورود",
          description: "ایمیل یا رمز عبور اشتباه است",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "خطا در ورود",
        description: "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6 text-brand-600 hover:text-brand-700"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">رویداد یار</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ورود به حساب
          </h1>
          <p className="text-gray-600">به پنل مدیریت رویدادهایتان بروید</p>
        </div>

        <Card className="border-2 border-brand-100">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">خوش آمدید</CardTitle>
            <CardDescription>اطلاعات حساب خود را وارد کنید</CardDescription>
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
                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.email
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
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
                      errors.password
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="رمز عبور خود را وارد کنید"
                    required
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
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
                <Link
                  to="/forgot-password"
                  className="text-sm text-brand-600 hover:text-brand-700"
                >
                  فراموشی رمز عبور؟
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 py-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    در حال ورود...
                  </div>
                ) : (
                  "ورود به حساب"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                حساب ندارید؟{" "}
                <Link
                  to="/register"
                  className="text-brand-600 hover:text-brand-700 font-medium"
                >
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
          <Link
            to="/demo"
            className="block text-sm text-gray-500 hover:text-gray-700"
          >
            مشاهده دمو سیستم
          </Link>
          <Link
            to="/support"
            className="block text-sm text-gray-500 hover:text-gray-700"
          >
            نیاز به کمک دارید؟
          </Link>
        </div>
      </div>
    </div>
  );
}
