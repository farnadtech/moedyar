import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowRight, Users, Crown, DollarSign, Activity, Search, MoreHorizontal, Edit, Trash2, FileText, CreditCard, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAdminData();
  }, [currentPage, searchQuery]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, usersResponse, activitiesResponse] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getUsers(currentPage, 10, searchQuery),
        apiService.getAdminActivities()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (usersResponse.success) {
        setUsers(usersResponse.data.users);
        setPagination(usersResponse.data.pagination);
      }

      if (activitiesResponse.success) {
        setActivities(activitiesResponse.data);
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (action: 'delete' | 'upgrade', userId: string, newSubscription?: string) => {
    try {
      if (action === 'delete') {
        const confirmed = window.confirm('آیا از حذف این کاربر اطمینان دارید؟');
        if (!confirmed) return;

        const response = await apiService.deleteUser(userId);
        if (response.success) {
          toast({
            title: "کاربر حذف شد",
            description: "کاربر با موفقیت ��ذف شد"
          });
          loadAdminData();
        } else {
          toast({
            title: "خطا در حذف کاربر",
            description: response.message,
            variant: "destructive"
          });
        }
      } else if (action === 'upgrade' && newSubscription) {
        const response = await apiService.updateUserSubscription(userId, newSubscription);
        if (response.success) {
          toast({
            title: "اشتراک به‌روزرسانی شد",
            description: "اشتراک کاربر با موفقیت تغییر کرد"
          });
          loadAdminData();
        } else {
          toast({
            title: "خطا در به‌روزرسانی اشتراک",
            description: response.message,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "خطای سیستم",
        description: "خطا در ارتباط با سرور",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری پنل ادمین...</p>
        </div>
      </div>
    );
  }

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
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">پنل مدیریت</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 flex-wrap">
            <Link to="/admin/dashboard">
              <Button variant="default" className="bg-brand-600 hover:bg-brand-700">
                <Users className="w-4 h-4 mr-2" />
                مدیریت کاربران
              </Button>
            </Link>
            <Link to="/admin/events">
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                مشاهده رویدادها
              </Button>
            </Link>
            <Link to="/admin/transactions">
              <Button variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                تراکنش‌ها
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                تنظیمات سیستم
              </Button>
            </Link>
            <Link to="/admin/setup">
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                راهنمای راه‌اندازی
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کل کاربران</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total}</div>
                <p className="text-xs text-muted-foreground">
                  رایگان: {stats.users.free} | پرمیوم: {stats.users.premium} | کسب‌وکار: {stats.users.business}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کل رویدادها</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.events.total}</div>
                <p className="text-xs text-muted-foreground">رویدادهای فعال</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">اشتراک‌های فعال</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.subscriptions.active}</div>
                <p className="text-xs text-muted-foreground">پرمیوم و کسب‌وکار</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">درآمد کل</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.subscriptions.revenue)}</div>
                <p className="text-xs text-muted-foreground">از اشتراک‌ها</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Users Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>مدیریت کاربران</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="جستجو کاربران..."
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-brand-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{user.fullName}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              user.subscriptionType === 'FREE' ? 'bg-gray-100 text-gray-700' :
                              user.subscriptionType === 'PREMIUM' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {user.subscriptionType === 'FREE' ? 'رایگان' :
                               user.subscriptionType === 'PREMIUM' ? 'پرمیوم' : 'کسب‌وکار'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {user._count.events} رویداد
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={user.subscriptionType}
                          onChange={(e) => handleUserAction('upgrade', user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="FREE">رایگان</option>
                          <option value="PREMIUM">پرمیوم</option>
                          <option value="BUSINESS">کسب‌وکار</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction('delete', user.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-500">
                      صفحه {pagination.page} از {pagination.pages} ({pagination.total} کاربر)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        قبلی
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === pagination.pages}
                      >
                        بعدی
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>فعالیت‌های اخیر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Recent Users */}
                  {activities?.recentUsers && (
                    <div>
                      <h4 className="font-medium mb-3">کاربران جدید</h4>
                      <div className="space-y-2">
                        {activities.recentUsers.map((user: any) => (
                          <div key={user.id} className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <Users className="w-3 h-3 text-green-600" />
                            </div>
                            <div>
                              <span className="font-medium">{user.fullName}</span>
                              <p className="text-gray-500 text-xs">
                                {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Events */}
                  {activities?.recentEvents && (
                    <div>
                      <h4 className="font-medium mb-3">رویدادهای جدید</h4>
                      <div className="space-y-2">
                        {activities.recentEvents.map((event: any) => (
                          <div key={event.id} className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <Calendar className="w-3 h-3 text-blue-600" />
                            </div>
                            <div>
                              <span className="font-medium">{event.title}</span>
                              <p className="text-gray-500 text-xs">
                                {event.user.fullName}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Subscriptions */}
                  {activities?.recentSubscriptions && (
                    <div>
                      <h4 className="font-medium mb-3">اشتراک‌های جدید</h4>
                      <div className="space-y-2">
                        {activities.recentSubscriptions.map((sub: any) => (
                          <div key={sub.id} className="flex items-center gap-3 text-sm">
                            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                              <Crown className="w-3 h-3 text-purple-600" />
                            </div>
                            <div>
                              <span className="font-medium">{sub.type}</span>
                              <p className="text-gray-500 text-xs">
                                {sub.user.fullName}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
