import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ArrowRight,
  Search,
  Filter,
  Eye,
  FileText,
  Users,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { formatPersianDate } from "@/lib/persian-date";

export default function AdminEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [pagination, setPagination] = useState<any>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadEvents();
  }, [currentPage, searchQuery, eventTypeFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);

      const response = await apiService.getAdminEvents(
        currentPage,
        20,
        searchQuery,
        eventTypeFilter,
      );

      if (response.success) {
        setEvents(response.data.events);
        setPagination(response.data.pagination);
      } else {
        toast({
          title: "خطا در بارگذاری رویدادها",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading events:", error);
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeBadge = (eventType: string) => {
    const types: Record<string, { label: string; color: string }> = {
      BIRTHDAY: { label: "تولد", color: "bg-pink-100 text-pink-800" },
      INSURANCE: { label: "بیمه", color: "bg-blue-100 text-blue-800" },
      CONTRACT: { label: "قرارداد", color: "bg-green-100 text-green-800" },
      CHECK: { label: "چک", color: "bg-orange-100 text-orange-800" },
      CUSTOM: { label: "سفارشی", color: "bg-purple-100 text-purple-800" },
    };

    const type = types[eventType] || {
      label: eventType,
      color: "bg-gray-100 text-gray-800",
    };
    return <Badge className={type.color}>{type.label}</Badge>;
  };

  const getSubscriptionBadge = (subscriptionType: string) => {
    const types: Record<string, { label: string; color: string }> = {
      FREE: { label: "رایگان", color: "bg-gray-100 text-gray-800" },
      PREMIUM: { label: "پرمیوم", color: "bg-yellow-100 text-yellow-800" },
      BUSINESS: { label: "کسب‌وکار", color: "bg-purple-100 text-purple-800" },
    };

    const type = types[subscriptionType] || {
      label: subscriptionType,
      color: "bg-gray-100 text-gray-800",
    };
    return <Badge className={type.color}>{type.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return formatPersianDate(dateString, { format: "long" });
  };

  if (loading && events.length === 0) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری رویدادها...</p>
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
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700"
            >
              <ArrowRight className="w-4 h-4" />
              بازگشت به پنل ادمین
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                مدیریت رویدادها
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 flex-wrap">
            <Link to="/admin/dashboard">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                مدیریت کاربران
              </Button>
            </Link>
            <Button
              variant="default"
              className="bg-brand-600 hover:bg-brand-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              مشاهده رویدادها
            </Button>
            <Link to="/admin/transactions">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                تراکنش‌ها
              </Button>
            </Link>
            <Link to="/admin/settings">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                تنظیمات سیستم
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">فیلترها و جستجو</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="جستجو در عنوان، توضیحات یا نام کاربر..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="min-w-[150px]">
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">همه انواع</option>
                  <option value="BIRTHDAY">تولد</option>
                  <option value="INSURANCE">بیمه</option>
                  <option value="CONTRACT">قرارداد</option>
                  <option value="CHECK">چک</option>
                  <option value="CUSTOM">سفارشی</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>رویدادهای کاربران</span>
              {pagination && (
                <span className="text-sm font-normal text-gray-600">
                  {pagination.total} رویداد
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">هیچ رویدادی یافت نشد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="text-gray-600 text-sm mb-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(event.eventDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.user.fullName} ({event.user.email})
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getEventTypeBadge(event.eventType)}
                        {getSubscriptionBadge(event.user.subscriptionType)}
                      </div>
                    </div>

                    {/* Dynamic Fields */}
                    {event.dynamicFields &&
                      Object.keys(event.dynamicFields).length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <h4 className="font-medium text-sm text-gray-700 mb-2">
                            اطلاعات اضافی:
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {Object.entries(event.dynamicFields).map(
                              ([key, value]) => (
                                <div key={key} className="flex">
                                  <span className="font-medium text-gray-600 ml-2">
                                    {key}:
                                  </span>
                                  <span className="text-gray-800">
                                    {String(value)}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Reminders */}
                    {event.reminders && event.reminders.length > 0 && (
                      <div className="border-t pt-3">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">
                          یادآوری‌ها:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {event.reminders.map(
                            (reminder: any, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {formatDate(reminder.reminderDate)} -{" "}
                                {reminder.method}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  قبلی
                </Button>
                <span className="flex items-center px-4 text-sm text-gray-600">
                  صفحه {currentPage} از {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  بعدی
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
