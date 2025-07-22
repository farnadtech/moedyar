import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Bell,
  Plus,
  Settings,
  Crown,
  User,
  Users,
  LogOut,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import {
  formatPersianDate,
  formatPersianRelativeTime,
  formatPersianTime,
} from "@/lib/persian-date";

interface Event {
  id: string;
  title: string;
  eventDate: string;
  eventType: string;
  description?: string;
  reminders: Array<{
    id: string;
    daysBefore: number;
    method: string;
  }>;
}

interface User {
  id: string;
  fullName: string;
  email: string;
  subscriptionType: string;
  accountType: string;
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      if (!apiService.isAuthenticated()) {
        navigate("/login");
        return;
      }

      // Load user data, events, and subscription info in parallel
      const [userResponse, eventsResponse, subscriptionResponse] =
        await Promise.all([
          apiService.getCurrentUser(),
          apiService.getEvents(),
          apiService.getCurrentSubscription(),
        ]);

      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data.user);
      }

      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data.events);
      }

      if (subscriptionResponse.success && subscriptionResponse.data) {
        setSubscriptionData(subscriptionResponse.data);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "لطفاً صفحه را مجددا�� بارگذاری کنید",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const response = await apiService.deleteEvent(id);

      if (response.success) {
        setEvents(events.filter((e) => e.id !== id));
        toast({
          title: "رویداد حذف شد",
          description: "رویداد با موفقیت حذف ��د",
        });
      } else {
        toast({
          title: "خطا در حذف رویداد",
          description: response.message || "لطفاً دوباره تلاش کنید",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "خطا در حذف رویداد",
        description: "خطا در ارتباط با سرور",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    apiService.logout();
  };

  const formatDate = (dateString: string) => {
    return formatPersianDate(dateString, { format: "long" });
  };

  const formatDateTime = (dateString: string) => {
    return formatPersianDate(dateString, { format: "long", includeTime: true });
  };

  const formatRelativeDate = (dateString: string) => {
    const daysUntil = getDaysUntil(dateString);
    if (daysUntil === 0) return "امروز";
    if (daysUntil === 1) return "فردا";
    if (daysUntil === -1) return "دیروز";
    return formatPersianRelativeTime(dateString);
  };

  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BIRTHDAY: "تولد",
      INSURANCE: "بیمه",
      CONTRACT: "قرارداد",
      CHECK: "چک",
      CUSTOM: "سایر",
    };
    return labels[type] || type;
  };

  const isPremium =
    user?.subscriptionType === "PREMIUM" ||
    user?.subscriptionType === "BUSINESS";
  const isBusiness = user?.subscriptionType === "BUSINESS";
  const maxEvents = isPremium ? -1 : 3;

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  خوش آمدید، {user.fullName}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {user.accountType === "PERSONAL"
                      ? "حساب شخصی"
                      : "حساب کسب‌وکار"}
                  </span>
                  {!isPremium && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      رایگان ({events.length}/{maxEvents})
                    </span>
                  )}
                  {isPremium && (
                    <span className="px-2 py-1 bg-brand-100 text-brand-700 text-xs rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      {user.subscriptionType === "PREMIUM"
                        ? "پرمیوم"
                        : "کسب‌وکار"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isPremium && (
                <Link to="/premium">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-brand-600 border-brand-600 hover:bg-brand-50"
                  >
                    <Crown className="w-4 h-4 ml-1" />
                    ارتقا به پرمیوم
                  </Button>
                </Link>
              )}
              {user?.email === "farnadadmin@gmail.com" && (
                <Link to="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <User className="w-4 h-4 ml-1" />
                    پنل ادمین
                  </Button>
                </Link>
              )}
              {isBusiness && (
                <Link to="/team">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Users className="w-4 h-4 ml-1" />
                    مدیریت تیم
                  </Button>
                </Link>
              )}
              <Link to="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 ml-1" />
                  تنظیمات
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 ml-1" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Event Card */}
            <Card className="border-dashed border-2 border-brand-300 hover:border-brand-400 transition-colors">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-brand-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  رویداد جدید اضافه کنید
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  {isPremium
                    ? "رویداد نامحدود اضافه کنید و همیشه در جریان باشید"
                    : events.length >= maxEvents
                      ? "شما به حداکثر رویداد در پلن رایگان رسیده‌اید"
                      : `می‌توانید تا ${maxEvents - events.length} رویداد دیگر اضافه کنید`}
                </p>
                {!isPremium && events.length >= maxEvents ? (
                  <Button
                    className="bg-gray-400 cursor-not-allowed"
                    disabled={true}
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    حداکثر رویداد (3/3)
                  </Button>
                ) : (
                  <Link to="/add-event">
                    <Button className="bg-brand-600 hover:bg-brand-700">
                      <Plus className="w-4 h-4 ml-1" />
                      افزودن رویداد
                    </Button>
                  </Link>
                )}
                {!isPremium && events.length >= maxEvents && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    برای افزودن رویداد بیشتر،{" "}
                    <Link to="/premium" className="text-brand-600 underline">
                      ارتقا به پرمیوم
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Events List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                رویدادهای شما
              </h2>

              {events.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      هنوز رویدادی ندارید
                    </h3>
                    <p className="text-gray-400">
                      اولین رویدادتان را اضافه کنید
                    </p>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => {
                  const daysUntil = getDaysUntil(event.eventDate);
                  const isOverdue = daysUntil < 0;
                  const isUpcoming = daysUntil <= 7 && daysUntil >= 0;

                  return (
                    <Card
                      key={event.id}
                      className={`${isOverdue ? "border-red-200 bg-red-50" : isUpcoming ? "border-yellow-200 bg-yellow-50" : ""}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${isOverdue ? "bg-red-500" : isUpcoming ? "bg-yellow-500" : "bg-green-500"}`}
                            />
                            <div>
                              <CardTitle className="text-lg">
                                {event.title}
                              </CardTitle>
                              <CardDescription className="flex flex-col gap-1">
                                <span>
                                  {formatDateTime(event.eventDate)} •{" "}
                                  {getEventTypeLabel(event.eventType)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {formatRelativeDate(event.eventDate)}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link to={`/edit-event/${event.id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm">
                            {isOverdue ? (
                              <span className="text-red-600 font-medium">
                                {Math.abs(daysUntil)} روز گذشته
                              </span>
                            ) : daysUntil === 0 ? (
                              <span className="text-yellow-600 font-medium">
                                امروز!
                              </span>
                            ) : (
                              <span className="text-gray-600">
                                {daysUntil} روز مانده
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Bell className="w-4 h-4" />
                            یادآوری:{" "}
                            {[
                              ...new Set(
                                event.reminders.map((r) => r.daysBefore),
                              ),
                            ]
                              .sort((a, b) => a - b)
                              .join("، ")}{" "}
                            روز قبل
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600">
                            {event.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  وضعیت حساب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">نوع حساب:</span>
                    <span className="font-medium">
                      {isPremium ? "پرمیوم" : "رایگان"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رویدادها:</span>
                    <span className="font-medium">
                      {isPremium
                        ? `${events.length} رویداد`
                        : `${events.length}/۳`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">کانال‌های یادآوری:</span>
                    <span className="font-medium">
                      {isPremium ? "ایمیل، پیامک، واتس‌اپ" : "ایمیل"}
                    </span>
                  </div>
                </div>

                {!isPremium && (
                  <div className="mt-4 pt-4 border-t">
                    <Link to="/premium">
                      <Button className="w-full bg-brand-600 hover:bg-brand-700">
                        <Crown className="w-4 h-4 ml-1" />
                        ارتقا به پرمیوم
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>آمار سریع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">رویدادهای امروز:</span>
                    <span className="font-medium text-yellow-600">
                      {
                        events.filter((e) => getDaysUntil(e.eventDate) === 0)
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رویدادهای این هفته:</span>
                    <span className="font-medium text-blue-600">
                      {
                        events.filter((e) => {
                          const days = getDaysUntil(e.eventDate);
                          return days >= 0 && days <= 7;
                        }).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رویدادهای گذشته:</span>
                    <span className="font-medium text-red-600">
                      {
                        events.filter((e) => getDaysUntil(e.eventDate) < 0)
                          .length
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Panel Access */}
            {user?.email === "farnadadmin@gmail.com" && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-900">
                    <Settings className="w-5 h-5" />
                    پنل مدیریت سیستم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-700 mb-4">
                    دسترسی ادمین به مدیریت کاربران و تنظیمات سیستم
                  </p>
                  <div className="space-y-2">
                    <Link to="/admin/dashboard" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-red-600 text-red-600 hover:bg-red-50"
                      >
                        مدیریت کاربران
                      </Button>
                    </Link>
                    <Link to="/admin/settings" className="block">
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        تنظیمات سیستم
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Features */}
            {isBusiness && (
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <Users className="w-5 h-5" />
                    امکانات کسب‌وکار
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link to="/team" className="block">
                      <Button
                        variant="outline"
                        className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                      >
                        <Users className="w-4 h-4 ml-1" />
                        مدیریت تیم
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                      onClick={() => {
                        toast({
                          title: "🔧 در حال توسعه",
                          description: "تقویم مشترک به زودی اضافه می‌شود",
                        });
                      }}
                    >
                      <Calendar className="w-4 h-4 ml-1" />
                      تقویم مشترک
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-purple-600 text-purple-600 hover:bg-purple-50"
                      onClick={() => {
                        toast({
                          title: "🔧 در حال توسعه",
                          description: "گزارش‌گیری تیم به زودی اضافه می‌شود",
                        });
                      }}
                    >
                      <Eye className="w-4 h-4 ml-1" />
                      گزارش‌گیری تیم
                    </Button>
                  </div>
                  <p className="text-xs text-purple-600 mt-4">
                    ✨ امکانات ویژه حساب کسب‌وکار شما
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Premium Features Preview */}
            {!isPremium && user?.email !== "farnadadmin@gmail.com" && (
              <Card className="border-brand-200 bg-brand-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-brand-900">
                    <Crown className="w-5 h-5" />
                    مزایای پرمیوم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-brand-700">
                    <li>• رویدادهای نامحدود</li>
                    <li>• یادآوری پیامک</li>
                    <li>• یادآوری واتس‌اپ</li>
                    <li>• پشتیبانی اولویت‌دار</li>
                    <li>• گزارش‌گیری پیشرفته</li>
                  </ul>
                  <Link to="/premium" className="block mt-4">
                    <Button className="w-full bg-brand-600 hover:bg-brand-700">
                      آزمایش ۷ روزه رایگان
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
