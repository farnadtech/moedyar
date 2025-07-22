import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Bell, Plus, Settings, Crown, User, LogOut, Trash2, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  reminderDays: number[];
  description?: string;
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "تمدید بیمه خودرو",
      date: "2024-03-15",
      type: "بیمه",
      reminderDays: [30, 7, 1],
      description: "تمدید بیمه پژو ۲۰۶ پلاک ۱۲ج ۳۴۵"
    },
    {
      id: "2", 
      title: "تولد مادر",
      date: "2024-02-20",
      type: "تولد",
      reminderDays: [7, 1],
      description: "خرید کادو و گل"
    }
  ]);

  const [isPremium] = useState(false); // This would come from user's subscription status

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
                <h1 className="text-xl font-bold text-gray-900">رویداد یار</h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">حساب شخصی</span>
                  {!isPremium && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      رایگان ({events.length}/۳)
                    </span>
                  )}
                  {isPremium && (
                    <span className="px-2 py-1 bg-brand-100 text-brand-700 text-xs rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      پرمیوم
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isPremium && (
                <Link to="/premium">
                  <Button variant="outline" size="sm" className="text-brand-600 border-brand-600 hover:bg-brand-50">
                    <Crown className="w-4 h-4 ml-1" />
                    ارتقا به پرمیوم
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 ml-1" />
                تنظیمات
              </Button>
              <Button variant="ghost" size="sm">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">رویداد جدید اضافه کنید</h3>
                <p className="text-gray-600 text-center mb-4">
                  {isPremium 
                    ? "رویداد نامحدود اضافه کنید و همیشه در جریان باشید"
                    : `می‌توانید تا ${3 - events.length} رویداد دیگر اضافه کنید`
                  }
                </p>
                <Link to="/add-event">
                  <Button 
                    className="bg-brand-600 hover:bg-brand-700"
                    disabled={!isPremium && events.length >= 3}
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    افزودن رویداد
                  </Button>
                </Link>
                {!isPremium && events.length >= 3 && (
                  <p className="text-sm text-gray-500 mt-2">
                    برای افزودن رویداد بیشتر، <Link to="/premium" className="text-brand-600">ارتقا دهید</Link>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Events List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">رویدادهای شما</h2>
              
              {events.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-2">هنوز رویدادی ندارید</h3>
                    <p className="text-gray-400">اولین رویدادتان را اضافه کنید</p>
                  </CardContent>
                </Card>
              ) : (
                events.map((event) => {
                  const daysUntil = getDaysUntil(event.date);
                  const isOverdue = daysUntil < 0;
                  const isUpcoming = daysUntil <= 7 && daysUntil >= 0;
                  
                  return (
                    <Card key={event.id} className={`${isOverdue ? 'border-red-200 bg-red-50' : isUpcoming ? 'border-yellow-200 bg-yellow-50' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isOverdue ? 'bg-red-500' : isUpcoming ? 'bg-yellow-500' : 'bg-green-500'}`} />
                            <div>
                              <CardTitle className="text-lg">{event.title}</CardTitle>
                              <CardDescription>
                                {formatDate(event.date)} • {event.type}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
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
                              <span className="text-yellow-600 font-medium">امروز!</span>
                            ) : (
                              <span className="text-gray-600">
                                {daysUntil} روز مانده
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Bell className="w-4 h-4" />
                            یادآوری: {event.reminderDays.join('، ')} روز قبل
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-sm text-gray-600">{event.description}</p>
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
                      {isPremium ? `${events.length} رویداد` : `${events.length}/۳`}
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
                      {events.filter(e => getDaysUntil(e.date) === 0).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رویدادهای این هفته:</span>
                    <span className="font-medium text-blue-600">
                      {events.filter(e => {
                        const days = getDaysUntil(e.date);
                        return days >= 0 && days <= 7;
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رویدادهای گذشته:</span>
                    <span className="font-medium text-red-600">
                      {events.filter(e => getDaysUntil(e.date) < 0).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Features Preview */}
            {!isPremium && (
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
