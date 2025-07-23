import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  Calendar,
  TrendingUp,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { formatPersianDate } from "@/lib/persian-date";

interface TeamStats {
  totalEvents: number;
  upcomingEvents: number;
  overdueEvents: number;
  thisWeekEvents: number;
  eventsByType: Record<string, number>;
  eventsByUser: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    eventCount: number;
    upcomingCount: number;
    overdueCount: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
  }>;
}

export default function TeamReports() {
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("current-month");
  const [reportType, setReportType] = useState("overview");

  const { toast } = useToast();

  useEffect(() => {
    loadTeamStats();
  }, [dateRange]);

  const loadTeamStats = async () => {
    try {
      setLoading(true);

      // Load team events and calculate stats
      let response = await apiService.getTeamEvents();

      // If team events fail, fallback to user events
      if (!response.success) {
        console.log(
          "Team events failed, falling back to user events:",
          response.message,
        );
        response = await apiService.getEvents();
      }

      if (response.success && response.data) {
        // Add user data for events that don't have it (fallback case)
        const events = response.data.events.map((event: any) => ({
          ...event,
          user: event.user || {
            id: event.userId || "current-user",
            fullName: "کاربر فعلی",
            email: "current@user.com",
          },
        }));

        // Calculate comprehensive stats
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        const totalEvents = events.length;
        const upcomingEvents = events.filter(
          (e) => new Date(e.eventDate) >= now,
        ).length;
        const overdueEvents = events.filter(
          (e) => new Date(e.eventDate) < now,
        ).length;
        const thisWeekEvents = events.filter((e) => {
          const eventDate = new Date(e.eventDate);
          return (
            eventDate >= startOfWeek &&
            eventDate <=
              new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
          );
        }).length;

        // Events by type
        const eventsByType: Record<string, number> = {};
        events.forEach((event) => {
          eventsByType[event.eventType] =
            (eventsByType[event.eventType] || 0) + 1;
        });

        // Events by user
        const userEventMap: Record<string, any> = {};
        events.forEach((event) => {
          if (!userEventMap[event.userId]) {
            userEventMap[event.userId] = {
              userId: event.userId,
              userName: event.user?.fullName || "کاربر", // Use actual user data from team events
              userEmail: event.user?.email || "",
              eventCount: 0,
              upcomingCount: 0,
              overdueCount: 0,
            };
          }

          userEventMap[event.userId].eventCount++;

          if (new Date(event.eventDate) >= now) {
            userEventMap[event.userId].upcomingCount++;
          } else {
            userEventMap[event.userId].overdueCount++;
          }
        });

        const eventsByUser = Object.values(userEventMap);

        // Monthly trend (last 6 months)
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          const monthEvents = events.filter((e) => {
            const eventDate = new Date(e.eventDate);
            return eventDate >= monthStart && eventDate <= monthEnd;
          }).length;

          monthlyTrend.push({
            month: formatPersianDate(monthStart.toISOString(), {
              format: "month-year",
            }),
            count: monthEvents,
          });
        }

        setStats({
          totalEvents,
          upcomingEvents,
          overdueEvents,
          thisWeekEvents,
          eventsByType,
          eventsByUser,
          monthlyTrend,
        });
      } else {
        toast({
          title: "خطا در بارگذاری گزارش‌ها",
          description: response.message || "لطفاً دوباره تلاش کنید",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading team stats:", error);
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  const handleExportReport = () => {
    if (!stats) return;

    // Create CSV content
    const csvContent = [
      "نوع گزارش,مقدار",
      `کل رویدادها,${stats.totalEvents}`,
      `رویدادهای آینده,${stats.upcomingEvents}`,
      `رویدادهای گذشته,${stats.overdueEvents}`,
      `رویدادهای این هفته,${stats.thisWeekEvents}`,
      "",
      "نوع رویداد,تعداد",
      ...Object.entries(stats.eventsByType).map(
        ([type, count]) => `${getEventTypeLabel(type)},${count}`,
      ),
    ].join("\n");

    // Download CSV with proper UTF-8 BOM for Excel compatibility
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `team-report-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast({
      title: "گزارش دانلود شد",
      description: "فایل گزارش به صورت CSV ��انلود شد",
    });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری گزارش‌ها...</p>
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
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              <ArrowRight className="w-4 h-4" />
              بازگشت به داشبورد
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                گزارش‌گیری تیم
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="current-month">ماه جاری</option>
                  <option value="last-month">ماه گذشته</option>
                  <option value="last-3-months">۳ ماه گذشته</option>
                  <option value="last-6-months">۶ ماه گذشته</option>
                  <option value="current-year">سال جاری</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="overview">خلاصه کلی</option>
                  <option value="detailed">گزارش تفصیلی</option>
                  <option value="trends">روند زمانی</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleExportReport}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={!stats}
            >
              <Download className="w-4 h-4 ml-1" />
              دانلود گزارش
            </Button>
          </div>
        </div>

        {stats && (
          <>
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">کل رویدادها</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {stats.totalEvents}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        رویدادهای آینده
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {stats.upcomingEvents}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">این هفته</p>
                      <p className="text-3xl font-bold text-yellow-600">
                        {stats.thisWeekEvents}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">گذشته</p>
                      <p className="text-3xl font-bold text-red-600">
                        {stats.overdueEvents}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Events by Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    توزیع انو��ع رویداد
                  </CardTitle>
                  <CardDescription>تحلیل رویدادها بر اساس نوع</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.eventsByType).map(([type, count]) => {
                      const percentage = Math.round(
                        (count / stats.totalEvents) * 100,
                      );
                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-purple-500 rounded"></div>
                            <span className="text-sm font-medium">
                              {getEventTypeLabel(type)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {count}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    روند ماهانه
                  </CardTitle>
                  <CardDescription>
                    تعداد رویدادها در ۶ ماه گذشته
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.monthlyTrend.map((trend, index) => {
                      const maxCount = Math.max(
                        ...stats.monthlyTrend.map((t) => t.count),
                      );
                      const percentage =
                        maxCount > 0 ? (trend.count / maxCount) * 100 : 0;

                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{trend.month}</span>
                            <span className="text-gray-600">
                              {trend.count} رویداد
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Performance */}
            {stats.eventsByUser.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    عملکرد اعضای تیم
                  </CardTitle>
                  <CardDescription>
                    تحلیل رویدادها بر اساس کاربران
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.eventsByUser.map((user) => (
                      <div
                        key={user.userId}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{user.userName}</h3>
                            <p className="text-sm text-gray-500">
                              {user.userEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-medium text-gray-900">
                              {user.eventCount}
                            </p>
                            <p className="text-gray-500">کل</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-green-600">
                              {user.upcomingCount}
                            </p>
                            <p className="text-gray-500">آینده</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium text-red-600">
                              {user.overdueCount}
                            </p>
                            <p className="text-gray-500">گذشته</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Report Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>عملیات گزارش</CardTitle>
            <CardDescription>
              ابزارهای اضافی برای مدیریت گزارش‌ها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={loadTeamStats}>
                <Activity className="w-4 h-4 ml-1" />
                بروزرسانی داده‌ها
              </Button>
              <Link to="/team/calendar">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 ml-1" />
                  مشاهده تقویم تیم
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "���� در حال توسعه",
                    description:
                      "گزارش‌های پیشرفته بیشتر به زودی اضافه می‌شوند",
                  });
                }}
              >
                <BarChart3 className="w-4 h-4 ml-1" />
                گزارش‌های پیشرفته
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
