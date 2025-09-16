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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMarketplaceAuth } from "@/hooks/useMarketplaceAuth";
import { Eye, EyeOff, User, Building, ArrowRight } from "lucide-react";

export default function MarketplaceRegister() {
  const navigate = useNavigate();
  const { register, isLoading } = useMarketplaceAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "BUYER" as "BUYER" | "SELLER",
    businessName: "",
    businessType: "",
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    if (formData.phone && !/^09\d{9}$/.test(formData.phone)) {
      newErrors.phone = "شماره موبایل صحیح نیست";
    }

    if (!formData.password) {
      newErrors.password = "رمز عبور الزامی است";
    } else if (formData.password.length < 8) {
      newErrors.password = "رمز عبور باید حداقل ۸ کاراکتر باشد";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "تکرار رمز عبور مطابقت ندارد";
    }

    if (formData.role === "SELLER" && !formData.businessName.trim()) {
      newErrors.businessName = "نام کسب‌وکار برای فروشندگان الزامی است";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "پذیرش قوانین و مقررات الزامی است";
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
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        role: formData.role,
        businessName: formData.role === "SELLER" ? formData.businessName : undefined,
        businessType: formData.role === "SELLER" ? formData.businessType : undefined,
        acceptTerms: formData.acceptTerms,
      };

      const success = await register(registrationData);

      if (success) {
        toast({
          title: "ثبت نام موفقیت‌آمیز",
          description: formData.role === "SELLER" 
            ? "حساب فروشنده شما ایجاد شد. لطفاً منتظر تایید مدارک باشید."
            : "خوش آمدید! شما با موفقیت عضو موعدیار شدید.",
        });

        // Redirect based on role
        if (formData.role === "SELLER") {
          navigate("/seller/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast({
          title: "خطا در ثبت نام",
          description: "لطفاً اطلاعات خود را بررسی کنید و دوباره تلاش کنید.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطا در ثبت نام",
        description: error.message || "خطای غیرمنتظره‌ای رخ داد",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
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
          <h2 className="text-3xl font-bold text-gray-900">عضویت در موعدیار</h2>
          <p className="mt-2 text-gray-600">
            حساب کاربری خود را ایجاد کنید
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>اطلاعات حساب کاربری</CardTitle>
            <CardDescription>
              لطفاً اطلاعات زیر را با دقت تکمیل کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label>نوع حساب کاربری</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => handleInputChange("role", value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="BUYER" id="buyer" />
                    <Label htmlFor="buyer" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      خریدار
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="SELLER" id="seller" />
                    <Label htmlFor="seller" className="flex items-center gap-2 cursor-pointer">
                      <Building className="w-4 h-4" />
                      فروشنده
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">نام و نام خانوادگی *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={errors.fullName ? "border-red-500" : ""}
                  placeholder="نام و نام خانوادگی خود را وارد کنید"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  placeholder="example@domain.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">شماره موبایل</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={errors.phone ? "border-red-500" : ""}
                  placeholder="09123456789"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Business Info for Sellers */}
              {formData.role === "SELLER" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="businessName">نام کسب‌وکار *</Label>
                    <Input
                      id="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      className={errors.businessName ? "border-red-500" : ""}
                      placeholder="نام فروشگاه یا شرکت خود را وارد کنید"
                    />
                    {errors.businessName && (
                      <p className="text-sm text-red-600">{errors.businessName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessType">نوع کسب‌وکار</Label>
                    <Input
                      id="businessType"
                      type="text"
                      value={formData.businessType}
                      onChange={(e) => handleInputChange("businessType", e.target.value)}
                      placeholder="مثال: خرده‌فروشی، عمده‌فروشی، تولیدی"
                    />
                  </div>
                </>
              )}

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={errors.password ? "border-red-500 pl-10" : "pl-10"}
                    placeholder="حداقل ۸ کاراکتر"
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تکرار رمز عبور *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className={errors.confirmPassword ? "border-red-500 pl-10" : "pl-10"}
                    placeholder="رمز عبور را دوباره وارد کنید"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2 space-x-reverse">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange("acceptTerms", checked)}
                />
                <div className="space-y-1">
                  <Label htmlFor="acceptTerms" className="text-sm cursor-pointer">
                    <Link to="/terms" className="text-blue-600 hover:underline">
                      قوانین و مقررات
                    </Link>{" "}
                    و{" "}
                    <Link to="/privacy" className="text-blue-600 hover:underline">
                      حریم خصوصی
                    </Link>{" "}
                    موعدیار را می‌پذیرم
                  </Label>
                  {errors.acceptTerms && (
                    <p className="text-sm text-red-600">{errors.acceptTerms}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "در حال ثبت نام..." : "ثبت نام"}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                قبلاً عضو شده‌اید؟{" "}
                <Link
                  to="/marketplace/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  وارد شوید
                </Link>
              </p>
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