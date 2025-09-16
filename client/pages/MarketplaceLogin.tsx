import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMarketplaceAuth } from "@/hooks/useMarketplaceAuth";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function MarketplaceLogin() {
  const navigate = useNavigate();
  const { login, isLoading } = useMarketplaceAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    try {
      const success = await login(formData.email, formData.password);

      if (success) {
        toast({
          title: "ورود موفقیت‌آمیز",
          description: "خوش آمدید!",
        });

        // Redirect to appropriate dashboard based on user role
        // This would be determined from the user data returned by login
        navigate("/dashboard");
      } else {
        toast({
          title: "خطا در ورود",
          description: "ایمیل یا رمز عبور اشتباه است",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطا در ورود",
        description: error.message || "خطای غیرمنتظره‌ای رخ داد",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">م</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">موعدیار</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">ورود به حساب کاربری</h2>
          <p className="mt-2 text-gray-600">
            به پنل کاربری خود دسترسی پیدا کنید
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>ورود</CardTitle>
            <CardDescription>
              ایمیل و رمز عبور خود را وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  placeholder="example@domain.com"
                  autoFocus
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={errors.password ? "border-red-500 pl-10" : "pl-10"}
                    placeholder="رمز عبور خود را وارد کنید"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-left">
                <Link
                  to="/marketplace/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  فراموشی رمز عبور؟
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "در حال ورود..." : "ورود"}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">حساب‌های نمونه:</h3>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>خریدار:</strong> buyer@example.com / password123</p>
                <p><strong>فروشنده:</strong> seller@example.com / password123</p>
                <p><strong>مدیر:</strong> admin@example.com / password123</p>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                حساب کاربری ندارید؟{" "}
                <Link
                  to="/marketplace/register"
                  className="text-blue-600 hover:underline font-medium"
                >
                  ثبت نام کنید
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Login Methods */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">یا با روش‌های دیگر وارد شوید</p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "قابلیت در دست توسعه",
                      description: "ورود با شماره موبایل به زودی اضافه می‌شود",
                    });
                  }}
                >
                  ورود با شماره موبایل
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "قابلیت در دست توسعه",
                      description: "ورود با گوگل به زودی اضافه می‌شود",
                    });
                  }}
                >
                  ورود با گوگل
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}