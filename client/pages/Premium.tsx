import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, Crown, Check, Star, Zap, Shield, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function Premium() {
  const [plans, setPlans] = useState<any>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    
    // Check for payment result in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const plan = urlParams.get('plan');
    const reason = urlParams.get('reason');

    if (paymentStatus === 'success' && plan) {
      toast({
        title: "✅ پرداخت موفق",
        description: `اشتراک ${plan === 'premium' ? 'پرمیوم' : 'کسب‌وکار'} شما با موفقیت فعال شد!`,
      });
      // Clean URL
      window.history.replaceState({}, '', '/premium');
    } else if (paymentStatus === 'failed' && reason) {
      toast({
        title: "❌ پرداخت ناموفق",
        description: decodeURIComponent(reason),
        variant: "destructive"
      });
      // Clean URL
      window.history.replaceState({}, '', '/premium');
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "پرداخت لغو شد",
        description: "عملیات پرداخت توسط کاربر لغو شد",
        variant: "destructive"
      });
      // Clean URL
      window.history.replaceState({}, '', '/premium');
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [plansResponse, subscriptionResponse] = await Promise.all([
        apiService.getSubscriptionPlans(),
        isAuthenticated ? apiService.getCurrentSubscription() : Promise.resolve({ success: false })
      ]);

      if (plansResponse.success) {
        setPlans(plansResponse.data.plans);
      }

      if (subscriptionResponse.success) {
        setUserSubscription(subscriptionResponse.data);
      }

    } catch (error) {
      console.error('Error loading premium data:', error);
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planType: 'PREMIUM' | 'BUSINESS') => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setUpgrading(planType);

      console.log('🚀 Starting upgrade process for:', planType);

      const response = await apiService.upgradeSubscription(planType);

      console.log('📦 Upgrade response:', response);

      if (response.success && response.data?.paymentUrl) {
        toast({
          title: "در حال انتقال به درگاه پرداخت",
          description: "لطفاً کمی صبر کنید...",
        });

        // Add a small delay to ensure the toast is shown
        setTimeout(() => {
          window.location.href = response.data.paymentUrl;
        }, 1000);
      } else {
        const errorMessage = response.message || "لطفاً دوباره تلاش کنید";
        console.error('❌ Upgrade failed:', errorMessage);

        toast({
          title: "خطا در ایجاد درخواست پرداخت",
          description: errorMessage,
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('💥 Upgrade error:', error);

      const errorMessage = error?.message || "خطا در ارتباط با سرور";

      toast({
        title: "خطا در ارتقا",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const currentPlan = userSubscription?.currentType || 'FREE';
  const isPremium = currentPlan === 'PREMIUM';
  const isBusiness = currentPlan === 'BUSINESS';

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white" dir="rtl">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700">
            <ArrowRight className="w-4 h-4" />
            {isAuthenticated ? 'بازگشت به داشبورد' : 'بازگشت به صفحه اصلی'}
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ارتقا به پرمیوم</span>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            قدرت کامل رویداد یار را
            <span className="text-brand-600 block">تجربه کنید</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            با ارتقا به حساب پرمیوم، از امکانات پیشرفته و یادآوری‌های چندگانه بهره‌مند شوید
          </p>
          
          {isAuthenticated && (
            <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-8">
              <p className="text-brand-700">
                حساب فعلی شما: <strong>
                  {currentPlan === 'FREE' ? 'رایگان' : 
                   currentPlan === 'PREMIUM' ? 'پرمیوم' : 'کسب‌وکار'}
                </strong>
              </p>
              {userSubscription?.eventCount !== undefined && (
                <p className="text-brand-600 text-sm">
                  رویدادهای ثبت شده: {userSubscription.eventCount}
                  {currentPlan === 'FREE' && '/۳'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className={`border-2 ${currentPlan === 'FREE' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">رایگان</CardTitle>
              <div className="text-4xl font-bold text-gray-700">۰ تومان</div>
              <CardDescription>برای شروع و آزمایش</CardDescription>
              {currentPlan === 'FREE' && (
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  پکیج فعلی شما
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>تا ۳ رویداد</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>یادآوری ایمیل</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>پشتیبانی پایه</span>
                </li>
              </ul>
              {currentPlan !== 'FREE' && (
                <Button variant="outline" className="w-full" disabled>
                  پکیج فعلی شما
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={`border-2 relative ${currentPlan === 'PREMIUM' ? 'border-green-500 bg-green-50' : isPremium || isBusiness ? 'border-gray-200' : 'border-brand-500'}`}>
            {currentPlan === 'FREE' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-brand-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  پیشنهاد ویژه
                </span>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Crown className="w-6 h-6 text-brand-600" />
                پرمیوم
              </CardTitle>
              <div className="text-4xl font-bold text-brand-600">
                {plans?.PREMIUM?.price?.toLocaleString()} تومان
              </div>
              <CardDescription>ماهانه - لغو آسان</CardDescription>
              {currentPlan === 'PREMIUM' && (
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  پکیج فعلی شما
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
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
              
              {currentPlan === 'PREMIUM' ? (
                <Button variant="outline" className="w-full" disabled>
                  پکیج فعلی شما
                </Button>
              ) : currentPlan === 'BUSINESS' ? (
                <Button variant="outline" className="w-full" disabled>
                  شما پکیج کسب‌وکار دارید
                </Button>
              ) : (
                <Button 
                  className="w-full bg-brand-600 hover:bg-brand-700"
                  onClick={() => handleUpgrade('PREMIUM')}
                  disabled={upgrading === 'PREMIUM'}
                >
                  {upgrading === 'PREMIUM' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      در حا�� پردازش...
                    </div>
                  ) : (
                    <>
                      <Star className="w-4 h-4 ml-1" />
                      شروع آزمایشی ۷ روزه
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Business Plan */}
          <Card className={`border-2 ${currentPlan === 'BUSINESS' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Users className="w-6 h-6 text-purple-600" />
                کسب‌وکار
              </CardTitle>
              <div className="text-4xl font-bold text-purple-600">
                {plans?.BUSINESS?.price?.toLocaleString()} تومان
              </div>
              <CardDescription>ماهانه - پیشرفته</CardDescription>
              {currentPlan === 'BUSINESS' && (
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  پکیج فعلی شما
                </div>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>تمام امکانات پرمیوم</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>مدیریت چند کاربره</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>تقویم مشترک</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>گزارش‌گیری پیشرفته</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>پشتیبانی اختصاصی</span>
                </li>
              </ul>
              
              {currentPlan === 'BUSINESS' ? (
                <Button variant="outline" className="w-full" disabled>
                  پکیج فعلی شما
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                  onClick={() => handleUpgrade('BUSINESS')}
                  disabled={upgrading === 'BUSINESS'}
                >
                  {upgrading === 'BUSINESS' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      در حال پردازش...
                    </div>
                  ) : (
                    <>
                      <Users className="w-4 h-4 ml-1" />
                      ارتقا به کسب‌وکار
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Comparison */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">مقایسه جزئیات پکیج‌ها</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right font-medium text-gray-900">ویژگی</th>
                  <th className="px-6 py-4 text-center font-medium text-gray-900">رایگان</th>
                  <th className="px-6 py-4 text-center font-medium text-gray-900">پرمیوم</th>
                  <th className="px-6 py-4 text-center font-medium text-gray-900">کسب‌وکار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 font-medium">تعداد رویداد</td>
                  <td className="px-6 py-4 text-center">۳</td>
                  <td className="px-6 py-4 text-center">نامحدود</td>
                  <td className="px-6 py-4 text-center">نامحدود</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">یادآوری ایمیل</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">یادآوری پیامک</td>
                  <td className="px-6 py-4 text-center">❌</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">✅</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">یادآوری واتساپ</td>
                  <td className="px-6 py-4 text-center">❌</td>
                  <td className="px-6 py-4 text-center">✅</td>
                  <td className="px-6 py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">مدیریت چند کاربره</td>
                  <td className="px-6 py-4 text-center">❌</td>
                  <td className="px-6 py-4 text-center">❌</td>
                  <td className="px-6 py-4 text-center">✅</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-medium">گزارش‌گیری</td>
                  <td className="px-6 py-4 text-center">پایه</td>
                  <td className="px-6 py-4 text-center">پیشرفته</td>
                  <td className="px-6 py-4 text-center">کامل</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">پشتیبانی</td>
                  <td className="px-6 py-4 text-center">ایمیل</td>
                  <td className="px-6 py-4 text-center">اولویت‌دار</td>
                  <td className="px-6 py-4 text-center">اختصاصی</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-2xl mx-auto">
          <Shield className="w-12 h-12 text-brand-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">پرداخت امن با زرین‌پال</h3>
          <p className="text-gray-600 mb-6">
            تمام پرداخت‌ها از طریق درگاه معتبر زرین‌پال انجام می‌شود. اطلاعات شما کاملاً محفوظ است.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>🔒 SSL محافظت شده</span>
            <span>💳 تمام کارت‌های بانکی</span>
            <span>📱 پرداخت موبایلی</span>
          </div>
        </div>
      </div>
    </div>
  );
}
