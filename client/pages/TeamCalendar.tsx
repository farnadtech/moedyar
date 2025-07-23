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
  ArrowRight,
  Users,
  Eye,
  Filter,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";
import { formatPersianDate, formatPersianTime, gregorianToPersian } from "@/lib/persian-date";
import jalaali from "jalaali-js";

interface TeamEvent {
  id: string;
  title: string;
  eventDate: string;
  eventType: string;
  description?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  reminders: Array<{
    id: string;
    daysBefore: number;
    method: string;
  }>;
}

// Calendar Grid Component
function CalendarGrid({ events }: { events: TeamEvent[] }) {
  // Initialize with current Persian date
  const todayGregorian = new Date();
  const todayPersian = gregorianToPersian(todayGregorian);
  const [currentPersianDate, setCurrentPersianDate] = useState({
    year: todayPersian.year,
    month: todayPersian.month
  });

  // Get Persian month info
  const daysInPersianMonth = jalaali.jalaaliMonthLength(currentPersianDate.year, currentPersianDate.month);

  // Get first day of Persian month in Gregorian
  const firstDayGregorian = jalaali.toGregorian(currentPersianDate.year, currentPersianDate.month, 1);
  const firstDayDate = new Date(firstDayGregorian.gy, firstDayGregorian.gm - 1, firstDayGregorian.gd);
  const startingDayOfWeek = (firstDayDate.getDay() + 1) % 7; // Adjust for Persian week (Saturday = 0)

  // Generate calendar days
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add days of month
  for (let day = 1; day <= daysInPersianMonth; day++) {
    days.push(day);
  }

  // Get events for a specific Persian day
  const getEventsForDay = (persianDay: number) => {
    const gregorianDay = jalaali.toGregorian(currentPersianDate.year, currentPersianDate.month, persianDay);
    const dayDate = new Date(gregorianDay.gy, gregorianDay.gm - 1, gregorianDay.gd);

    return events.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate.toDateString() === dayDate.toDateString();
    });
  };

  const isToday = (persianDay: number) => {
    const gregorianDay = jalaali.toGregorian(currentPersianDate.year, currentPersianDate.month, persianDay);
    const dayDate = new Date(gregorianDay.gy, gregorianDay.gm - 1, gregorianDay.gd);
    return dayDate.toDateString() === todayGregorian.toDateString();
  };

  const goToPreviousMonth = () => {
    if (currentPersianDate.month === 1) {
      setCurrentPersianDate({
        year: currentPersianDate.year - 1,
        month: 12
      });
    } else {
      setCurrentPersianDate({
        year: currentPersianDate.year,
        month: currentPersianDate.month - 1
      });
    }
  };

  const goToNextMonth = () => {
    if (currentPersianDate.month === 12) {
      setCurrentPersianDate({
        year: currentPersianDate.year + 1,
        month: 1
      });
    } else {
      setCurrentPersianDate({
        year: currentPersianDate.year,
        month: currentPersianDate.month + 1
      });
    }
  };

  const monthNames = [
    "ژ��نویه", "فوریه", "مارس", "آوریل", "می", "ژوئن",
    "ژوئیه", "آگوست", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"
  ];

  const dayNames = ["ی", "د", "س", "چ", "پ", "ج", "ش"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <CardTitle>
            {monthNames[month]} {year}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(dayName => (
            <div key={dayName} className="p-2 text-center font-medium text-gray-600 text-sm">
              {dayName}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`min-h-[80px] p-1 border border-gray-200 ${
                day ? 'bg-white' : 'bg-gray-50'
              } ${day && isToday(day) ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              {day && (
                <>
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(day) ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {getEventsForDay(day).slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className="text-xs p-1 bg-purple-100 text-purple-800 rounded truncate"
                        title={`${event.title} - ${event.user.fullName}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {getEventsForDay(day).length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{getEventsForDay(day).length - 2} بیشتر
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamCalendar() {
  const [events, setEvents] = useState<TeamEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");

  const { toast } = useToast();

  useEffect(() => {
    loadTeamEvents();
  }, [filterType]);

  const loadTeamEvents = async () => {
    try {
      setLoading(true);

      // First try to load team events, fallback to user events
      let response = await apiService.getTeamEvents();

      // If team events fail (user not in team, etc.), fallback to user events
      if (!response.success) {
        console.log(
          "Team events failed, falling back to user events:",
          response.message,
        );
        response = await apiService.getEvents();
      }

      if (response.success && response.data) {
        // Add mock user data for events that don't have it
        const eventsWithUser = response.data.events.map((event: any) => ({
          ...event,
          user: event.user || {
            id: "current-user",
            fullName: "کاربر فعلی",
            email: "current@user.com",
          },
        }));
        setEvents(eventsWithUser);
      } else {
        toast({
          title: "خطا در بارگذاری رویدادها",
          description: response.message || "لطفاً دوباره تلاش کنید",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading team events:", error);
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "لطفاً صفحه را مجدداً بارگذا��ی کنید",
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

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      BIRTHDAY: "bg-pink-100 text-pink-800 border-pink-200",
      INSURANCE: "bg-blue-100 text-blue-800 border-blue-200",
      CONTRACT: "bg-green-100 text-green-800 border-green-200",
      CHECK: "bg-orange-100 text-orange-800 border-orange-200",
      CUSTOM: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredEvents = events.filter((event) => {
    if (!filterType) return true;
    return event.eventType === filterType;
  });

  const upcomingEvents = filteredEvents
    .filter((event) => getDaysUntil(event.eventDate) >= 0)
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
    );

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری تقویم تیم...</p>
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
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">تقویم تیم</span>
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
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">همه انواع رویداد</option>
                  <option value="BIRTHDAY">تولد</option>
                  <option value="INSURANCE">بیمه</option>
                  <option value="CONTRACT">قرارداد</option>
                  <option value="CHECK">چک</option>
                  <option value="CUSTOM">سایر</option>
                </select>
              </div>

              <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-purple-600" : ""}
                >
                  فهرست
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className={viewMode === "calendar" ? "bg-purple-600" : ""}
                >
                  تقویم
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadTeamEvents}
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ml-1 ${loading ? "animate-spin" : ""}`}
                />
                بروزرسانی
              </Button>
              <Link to="/add-event">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 ml-1" />
                  رویداد جدید
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">کل رویدادها</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredEvents.length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">رویدادهای آینده</p>
                  <p className="text-2xl font-bold text-green-600">
                    {upcomingEvents.length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">این هفته</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {
                      upcomingEvents.filter(
                        (e) => getDaysUntil(e.eventDate) <= 7,
                      ).length
                    }
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">امروز</p>
                  <p className="text-2xl font-bold text-red-600">
                    {
                      upcomingEvents.filter(
                        (e) => getDaysUntil(e.eventDate) === 0,
                      ).length
                    }
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Display */}
        {viewMode === "list" ? (
          /* List View */
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              رویدادهای آینده تیم
            </h2>

            {upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">
                    رویدادی یافت نشد
                  </h3>
                  <p className="text-gray-400">
                    {filterType
                      ? "فیلتر مورد نظر را تغییر دهید"
                      : "هنوز رویدادی در تیم وجود ندارد"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              upcomingEvents.map((event) => {
                const daysUntil = getDaysUntil(event.eventDate);
                const isToday = daysUntil === 0;
                const isThisWeek = daysUntil <= 7;

                return (
                  <Card
                    key={event.id}
                    className={`${
                      isToday
                        ? "border-red-200 bg-red-50"
                        : isThisWeek
                          ? "border-yellow-200 bg-yellow-50"
                          : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              isToday
                                ? "bg-red-500"
                                : isThisWeek
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                          />
                          <div>
                            <CardTitle className="text-lg">
                              {event.title}
                            </CardTitle>
                            <CardDescription className="flex flex-col gap-1">
                              <span>
                                {formatPersianDate(event.eventDate, {
                                  format: "long",
                                  includeTime: true,
                                })}{" "}
                                • {getEventTypeLabel(event.eventType)}
                              </span>
                              <span className="text-xs flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {event.user?.fullName || "کاربر ناشناس"}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getEventTypeColor(event.eventType)}`}
                        >
                          {getEventTypeLabel(event.eventType)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          {isToday ? (
                            <span className="text-red-600 font-medium">
                              امروز!
                            </span>
                          ) : (
                            <span className="text-gray-600">
                              {daysUntil} روز مانده
                            </span>
                          )}
                        </div>
                        {event.reminders.length > 0 && (
                          <div className="text-xs text-gray-500">
                            ی��دآوری:{" "}
                            {[
                              ...new Set(
                                event.reminders.map((r) => r.daysBefore),
                              ),
                            ]
                              .sort((a, b) => a - b)
                              .join(", ")}{" "}
                            روز قبل
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {event.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        ) : (
          /* Calendar View */
          <CalendarGrid events={filteredEvents} />
        )}
      </div>
    </div>
  );
}
