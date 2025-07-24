import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ArrowRight, Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("ایمیل الزامی است");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("فرمت ایمیل صحیح نیست");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call the actual API endpoint
      const response = await apiService.request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      
      if (response.success) {
        setIsSubmitted(true);
        toast({
          title: "✅ ایمیل ارسال شد",
          description: response.message || "لینک بازیابی رمز عبور به ایمیل شما ارسال شد.",
        });
      } else {
        setError(response.message || "خطا در ارسال ایمیل. لطفاً دوباره تلاش کنید.");
      }
    } catch (error: any) {
      const errorMessage = error.message || "خطا در ارسال ایمیل. لطفاً دوباره تلاش کنید.";
      setError(errorMessage);
      toast({
        title: "❌ خطا",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/login" className="inline-flex items-center gap-2 mb-6 text-brand-600 hover:text-brand-700">
              <ArrowRight className="w-4 h-4" />
              بازگشت به ورود
            </Link>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">رویداد یار</span>
            </div>
          </div>

          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-900">ایمیل ارسال شد</CardTitle>
              <CardDescription className="text-green-700">
                اگر حساب کاربری با این ایمیل وجود داشته باشد، لینک بازیابی رمز عبور برای شما ارسال خواهد شد
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-green-800 mb-6">
                اگر حساب کاربری با این ایمیل وجود داشته باشد، لینک بازیابی رمز عبور برای شما ارسال خواهد شد.
                لطفاً ایمیل خود را بررسی کرده و در صورت دریافت، روی لینک بازیابی کلیک کنید.
                اگر ایمیل را دریافت نکردید، پوشه اسپم را نیز بررسی کنید.
              </p>
              <div className="space-y-3">
                <Link to="/login">
                  <Button className="w-full bg-brand-600 hover:bg-brand-700">
                    بازگشت به ورود
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                >
                  ارسال مجدد ایمیل
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 mb-6 text-brand-600 hover:text-brand-700">
            <ArrowRight className="w-4 h-4" />
            بازگشت به ورود
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">رویداد یار</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">بازیابی رمز عبور</CardTitle>
            <CardDescription>
              ایمیل خود را وارد کنید تا لینک بازیابی برای شما ارسال شود
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  className={error ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-brand-600 hover:bg-brand-700"
                disabled={isLoading}
              >
                {isLoading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                رمز عبور خود را به یاد آوردید؟{" "}
                <Link to="/login" className="text-brand-600 hover:text-brand-700 font-medium">
                  ورود
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            حساب کاربری ندارید؟{" "}
            <Link to="/register/personal" className="text-brand-600 hover:text-brand-700">
              ثبت نام کنید
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}