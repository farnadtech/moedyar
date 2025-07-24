import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, ArrowRight, Lock, CheckCircle } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      toast({
        title: "❌ لینک نامعتبر",
        description: "لینک بازیابی رمز عبور نامعتبر است.",
        variant: "destructive",
      });
      navigate('/forgot-password');
    }
  }, [token, email, navigate, toast]);

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "رمز عبور باید حداقل ۶ کاراکتر باشد";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError("رمز عبور الزامی است");
      return;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiService.request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ 
          token, 
          email, 
          password 
        })
      });
      
      if (response.success) {
        setIsSuccess(true);
        toast({
          title: "✅ رمز عبور تغییر کرد",
          description: "رمز عبور شما با موفقیت تغییر کرد.",
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || "خطا در تغییر رمز عبور. لطفاً دوباره تلاش کنید.");
      }
    } catch (error: any) {
      const errorMessage = error.message || "خطا در تغییر رمز عبور. لطفاً دوباره تلاش کنید.";
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4" dir="rtl">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
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
              <CardTitle className="text-xl text-green-900">رمز عبور تغییر کرد</CardTitle>
              <CardDescription className="text-green-700">
                رمز عبور شما با موفقیت تغییر کرد
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-green-800 mb-6">
                اکنون می‌توانید با رمز عبور جدید وارد حساب کاربری خود شوید.
              </p>
              <Link to="/login">
                <Button className="w-full bg-brand-600 hover:bg-brand-700">
                  ورود به حساب کاربری
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!token || !email) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/forgot-password" className="inline-flex items-center gap-2 mb-6 text-brand-600 hover:text-brand-700">
            <ArrowRight className="w-4 h-4" />
            بازگشت
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
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">تنظیم رمز عبور جدید</CardTitle>
            <CardDescription>
              رمز عبور جدید خود را وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور جدید</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="حداقل ۶ کاراکتر"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className={error ? "border-red-500" : ""}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="رمز عبور را مجدداً وارد کنید"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className={error ? "border-red-500" : ""}
                  disabled={isLoading}
                />
              </div>
              
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full bg-brand-600 hover:bg-brand-700"
                disabled={isLoading}
              >
                {isLoading ? "در حال تغییر..." : "تغییر رمز عبور"}
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
      </div>
    </div>
  );
}