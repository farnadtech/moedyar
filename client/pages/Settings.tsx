import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, User, Bell, Shield, Smartphone, Mail, Crown, Save, Edit2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

export default function Settings() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: false,
    reminderTiming: [1, 7] // Default reminder days
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      if (!apiService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      const [userResponse, subscriptionResponse] = await Promise.all([
        apiService.getCurrentUser(),
        apiService.getCurrentSubscription()
      ]);

      if (userResponse.success && userResponse.data) {
        const userData = userResponse.data.user;
        setUser(userData);
        setProfileData({
          fullName: userData.fullName || "",
          email: userData.email || "",
          phone: userData.phone || ""
        });
      }

      if (subscriptionResponse.success && subscriptionResponse.data) {
        setSubscription(subscriptionResponse.data);
        
        // Set notification settings based on subscription
        const isPremium = subscriptionResponse.data.currentType !== 'FREE';
        setNotificationSettings(prev => ({
          ...prev,
          smsNotifications: isPremium,
          whatsappNotifications: isPremium
        }));
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await apiService.updateProfile({
        fullName: profileData.fullName,
        phone: profileData.phone
      });

      if (response.success) {
        // Update local user data
        if (response.data?.user) {
          setUser(response.data.user);
          setProfileData({
            fullName: response.data.user.fullName || "",
            email: response.data.user.email || "",
            phone: response.data.user.phone || ""
          });
        }

        toast({
          title: "✅ پروفایل به‌روزرسانی شد",
          description: "تغییرات با موفقیت ذخیره شد"
        });
      } else {
        toast({
          title: "خطا در به‌روزرسانی",
          description: response.message || "لطفاً دوباره تلاش کنید",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "خطا در به‌روزرسانی",
        description: "خطا در ارتباط با ��رور",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Here you would call an API to update notification settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "✅ تنظیمات یادآوری به‌روزرسانی شد",
        description: "تغییرات با موفقیت ذخیره شد"
      });

    } catch (error) {
      toast({
        title: "خطا در به‌روزرسانی",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
  };

  const handleTestNotification = async (method: 'EMAIL' | 'SMS' | 'WHATSAPP') => {
    try {
      setSaving(true);

      const response = await apiService.testNotification(method);

      if (response.success) {
        toast({
          title: response.data?.demoMode ? "📧 حالت دمو" : "✅ یادآوری تست ارسال شد",
          description: response.message,
          variant: response.data?.demoMode ? "default" : "default"
        });
      } else {
        toast({
          title: "خطا در ارسال تست",
          description: response.message || "لطفاً دوباره تلاش کنید",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "خطا در ارسال تست",
        description: "خطا در ارتباط با سرور",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    toast({
      title: "🔧 در حال توسعه",
      description: "قابلیت تغییر رمز عبور به زودی اضافه خواهد شد",
    });
  };

  const handleLogoutAllDevices = () => {
    toast({
      title: "خروج از همه دستگاه‌ها",
      description: "شما از تمام دستگاه‌ها خارج شدید",
    });
    apiService.logout();
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'آیا واقعاً می‌خواهید حساب کاربری خود را برای همیشه حذف کنید؟ این عمل غیرقابل بازگشت است.'
    );

    if (confirmed) {
      toast({
        title: "🔧 در حال توسعه",
        description: "قابلیت حذف حساب به زودی اضافه خواهد شد",
      });
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

  const tabs = [
    { id: 'profile', label: 'پروفایل', icon: User },
    { id: 'notifications', label: 'یادآوری‌ها', icon: Bell },
    { id: 'subscription', label: 'اشتراک', icon: Crown },
    { id: 'security', label: 'امنیت', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700">
              <ArrowRight className="w-4 h-4" />
              بازگشت به داشبورد
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">تنظیمات</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-gray-50 transition-colors ${
                            activeTab === tab.id ? 'bg-brand-50 text-brand-700 border-l-2 border-brand-500' : 'text-gray-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      اطلاعات پروفایل
                    </CardTitle>
                    <CardDescription>
                      اطلاعات شخصی و تماس خود را مدیریت کنید
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نام و نام خانوادگی
                        </label>
                        <input
                          type="text"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          placeholder="نام کامل خود را وارد کنید"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ایمیل
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          placeholder="your-email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          شماره تلفن
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          placeholder="09123456789"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          برای دریافت پیامک و واتس‌اپ لازم است
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button type="submit" disabled={saving} className="bg-brand-600 hover:bg-brand-700">
                          {saving ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              در حال ذخیره...
                            </div>
                          ) : (
                            <>
                              <Save className="w-4 h-4 ml-1" />
                              ذخیره تغییرات
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      تنظیمات یادآوری
                    </CardTitle>
                    <CardDescription>
                      نحوه دریافت یادآوری‌ها را تنظیم کنید
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleNotificationSubmit} className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">روش‌های یادآوری</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-blue-500" />
                              <div>
                                <div className="font-medium">ایمیل</div>
                                <div className="text-sm text-gray-500">دریافت یادآوری از طریق ایمیل</div>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={notificationSettings.emailNotifications}
                              onChange={(e) => setNotificationSettings(prev => ({ 
                                ...prev, 
                                emailNotifications: e.target.checked 
                              }))}
                              className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Smartphone className="w-5 h-5 text-green-500" />
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  پیامک
                                  {subscription?.currentType === 'FREE' && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">پرمیوم</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">دریافت یادآوری از طریق پیامک</div>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={notificationSettings.smsNotifications}
                              onChange={(e) => setNotificationSettings(prev => ({ 
                                ...prev, 
                                smsNotifications: e.target.checked 
                              }))}
                              disabled={subscription?.currentType === 'FREE'}
                              className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 disabled:opacity-50"
                            />
                          </div>

                          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 text-green-600 text-center">💬</div>
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  واتس‌اپ
                                  {subscription?.currentType === 'FREE' && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">پرمیوم</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">دریافت یادآوری از طریق واتس‌اپ</div>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={notificationSettings.whatsappNotifications}
                              onChange={(e) => setNotificationSettings(prev => ({ 
                                ...prev, 
                                whatsappNotifications: e.target.checked 
                              }))}
                              disabled={subscription?.currentType === 'FREE'}
                              className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 disabled:opacity-50"
                            />
                          </div>
                        </div>

                        {subscription?.currentType === 'FREE' && (
                          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              برای استفاده از پیامک و واتس‌اپ، نیاز به{" "}
                              <Link to="/premium" className="text-brand-600 font-medium">ارتقا به حساب پرمیوم</Link> دارید.
                            </p>
                          </div>
                        )}

                        {/* Test Notifications */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">تست یادآوری</h4>
                          <p className="text-sm text-blue-700 mb-3">
                            برای اطمینان از عملکرد سیستم، یادآوری تستی ارسال کنید
                          </p>
                          <div className="flex gap-2 mb-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestNotification('EMAIL')}
                              disabled={saving}
                            >
                              تست ایمیل
                            </Button>
                            {subscription?.currentType !== 'FREE' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTestNotification('SMS')}
                                  disabled={saving}
                                >
                                  تست پیامک
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTestNotification('WHATSAPP')}
                                  disabled={saving}
                                >
                                  تست واتساپ
                                </Button>
                              </>
                            )}
                          </div>
                          <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
                            💡 <strong>توجه:</strong> در حال حاضر سیستم در حالت دمو قرار دارد.
                            برای ارسال واقعی ایمیل، مدیر سیستم باید تنظیمات SMTP را پیکربندی کند.
                          </div>
                        </div>
                      </div>

                      <Button type="submit" disabled={saving} className="bg-brand-600 hover:bg-brand-700">
                        {saving ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            در حال ذخیره...
                          </div>
                        ) : (
                          <>
                            <Save className="w-4 h-4 ml-1" />
                            ذخیره تنظیمات
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      اشتراک شما
                    </CardTitle>
                    <CardDescription>
                      مدیریت اشتراک و پکیج فعلی
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-brand-50 to-brand-100 border border-brand-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-brand-900">
                              {subscription?.currentType === 'FREE' ? 'حساب رایگان' : 
                               subscription?.currentType === 'PREMIUM' ? 'حساب پرمیوم' : 'حساب کسب‌وکار'}
                            </h3>
                            <p className="text-brand-700">
                              {subscription?.currentType === 'FREE' ? 'محدود به ۳ رویداد' : 'رویدادهای نامحدود'}
                            </p>
                          </div>
                          {subscription?.currentType !== 'FREE' && (
                            <Crown className="w-8 h-8 text-brand-600" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-brand-600">رویدادهای ثبت شده:</span>
                            <div className="font-semibold text-brand-900">
                              {subscription?.eventCount || 0}
                              {subscription?.currentType === 'FREE' && '/۳'}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm text-brand-600">روش‌های یادآوری:</span>
                            <div className="font-semibold text-brand-900">
                              {subscription?.currentType === 'FREE' ? 'ایمیل' : 'ایمیل، پیامک، واتساپ'}
                            </div>
                          </div>
                        </div>

                        {subscription?.currentType === 'FREE' ? (
                          <div className="flex gap-3">
                            <Link to="/premium" className="flex-1">
                              <Button className="w-full bg-brand-600 hover:bg-brand-700">
                                <Crown className="w-4 h-4 ml-1" />
                                ارتقا به پرمیوم
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1">
                              <Edit2 className="w-4 h-4 ml-1" />
                              تغییر پکیج
                            </Button>
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                              لغو اشتراک
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Feature Comparison */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">مقایسه پکیج‌ها</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full border border-gray-200 rounded-lg">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-right">ویژگی</th>
                                <th className="px-4 py-3 text-center">رایگان</th>
                                <th className="px-4 py-3 text-center">پرمیوم</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              <tr>
                                <td className="px-4 py-3">تعداد رویداد</td>
                                <td className="px-4 py-3 text-center">۳</td>
                                <td className="px-4 py-3 text-center">نامحدود</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3">یادآوری ایمیل</td>
                                <td className="px-4 py-3 text-center">✅</td>
                                <td className="px-4 py-3 text-center">✅</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3">یادآوری پیامک</td>
                                <td className="px-4 py-3 text-center">❌</td>
                                <td className="px-4 py-3 text-center">✅</td>
                              </tr>
                              <tr>
                                <td className="px-4 py-3">یادآوری واتساپ</td>
                                <td className="px-4 py-3 text-center">❌</td>
                                <td className="px-4 py-3 text-center">✅</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      امنیت حساب
                    </CardTitle>
                    <CardDescription>
                      تنظیمات امنیتی و رمز عبور
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium mb-2">تغی��ر رمز عبور</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          برای امنیت بیشتر، رمز عبور خود را به‌طور مرتب تغییر دهید
                        </p>
                        <Button variant="outline" onClick={handleChangePassword}>
                          <Shield className="w-4 h-4 ml-1" />
                          تغییر رمز عبور
                        </Button>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium mb-2">خروج از همه دستگاه‌ها</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          از تمام دستگاه‌های متصل به حساب خود خارج شوید
                        </p>
                        <Button variant="outline" onClick={handleLogoutAllDevices}>
                          خروج از همه دستگاه‌ها
                        </Button>
                      </div>

                      <div className="border border-red-200 rounded-lg p-4">
                        <h3 className="font-medium text-red-700 mb-2">حذف حساب</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          حذف دائمی حساب کاربری و تمام اطلاعات مرتبط
                        </p>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                          حذف حساب
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
