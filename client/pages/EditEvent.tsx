import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PersianCalendarPicker } from "@/components/ui/persian-calendar-picker";
import { Calendar, ArrowRight, Save, Bell, Check, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

const eventTypes = [
  { value: "BIRTHDAY", label: "تولد", icon: "🎂" },
  { value: "INSURANCE", label: "بیمه", icon: "🛡️" },
  { value: "CONTRACT", label: "قرارداد", icon: "📋" },
  { value: "CHECK", label: "چک", icon: "💰" },
  { value: "CUSTOM", label: "سایر", icon: "📅" },
];

const reminderMethods = [
  { value: "EMAIL", label: "ایمیل", icon: "📧", free: true },
  { value: "SMS", label: "پیامک", icon: "📱", free: false },
  { value: "WHATSAPP", label: "واتس‌اپ", icon: "💬", free: false },
];

const reminderDaysOptions = [
  { value: 1, label: "۱ روز قبل" },
  { value: 3, label: "۳ روز قبل" },
  { value: 7, label: "۱ هفته قبل" },
  { value: 14, label: "۲ هفته قبل" },
  { value: 30, label: "۱ ماه قبل" },
  { value: 60, label: "۲ ماه قبل" },
];

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    eventType: "CUSTOM",
  });

  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>(
    {},
  );

  // Get dynamic fields based on event type
  const getDynamicFields = (eventType: string) => {
    switch (eventType) {
      case "BIRTHDAY":
        return [
          {
            key: "person_name",
            label: "نام فرد",
            placeholder: "نام کامل فرد",
            required: false,
          },
          {
            key: "relation",
            label: "نسبت",
            placeholder: "مثال: پدر، مادر، دوست",
            required: false,
          },
          {
            key: "gift_idea",
            label: "ایده کادو",
            placeholder: "چه کادویی بخرید؟",
            required: false,
          },
        ];
      case "INSURANCE":
        return [
          {
            key: "insurance_type",
            label: "نوع بیمه",
            placeholder: "مثال: خودرو، درمان، آتش‌سوزی",
            required: false,
          },
          {
            key: "policy_number",
            label: "شماره بیمه‌نامه",
            placeholder: "شماره بیمه‌نامه",
            required: false,
          },
          {
            key: "company_name",
            label: "نام شرکت بیمه",
            placeholder: "نام شرکت بیمه‌گر",
            required: false,
          },
          {
            key: "premium_amount",
            label: "مبلغ حق بیمه",
            placeholder: "مبلغ به تومان",
            required: false,
          },
        ];
      case "CONTRACT":
        return [
          {
            key: "contract_type",
            label: "نوع قرارداد",
            placeholder: "مثال: اجاره، خرید، کاری",
            required: false,
          },
          {
            key: "other_party",
            label: "طرف مقابل",
            placeholder: "نام شخص یا شرکت",
            required: false,
          },
          {
            key: "contract_value",
            label: "ارزش قرارداد",
            placeholder: "مبلغ به تومان",
            required: false,
          },
          {
            key: "renewal_terms",
            label: "شرایط تمدید",
            placeholder: "نحوه تمدید قرارداد",
            required: false,
          },
        ];
      case "CHECK":
        return [
          {
            key: "check_number",
            label: "شماره چک",
            placeholder: "شماره چک",
            required: false,
          },
          {
            key: "bank_name",
            label: "نام بانک",
            placeholder: "نام بانک صادرکننده",
            required: false,
          },
          {
            key: "amount",
            label: "مبلغ چک",
            placeholder: "مبلغ به تومان",
            required: false,
          },
          {
            key: "recipient",
            label: "گیرنده چک",
            placeholder: "نام گیرنده",
            required: false,
          },
          {
            key: "account_number",
            label: "شماره حساب",
            placeholder: "شماره حساب",
            required: false,
          },
        ];
      default:
        return [];
    }
  };

  const [selectedReminderDays, setSelectedReminderDays] = useState<number[]>(
    [],
  );
  const [selectedReminderMethods, setSelectedReminderMethods] = useState<
    string[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userSubscription, setUserSubscription] = useState<any>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadEventData();
      loadSubscriptionData();
    }
  }, [id]);

  const loadEventData = async () => {
    try {
      setPageLoading(true);
      const response = await apiService.getEvent(id!);

      if (response.success && response.data) {
        const event = response.data.event;

        // Extract date and time
        const eventDateTime = new Date(event.eventDate);
        const eventDateOnly = eventDateTime.toISOString().split("T")[0];
        const eventTimeOnly = eventDateTime.toTimeString().slice(0, 5);

        setFormData({
          title: event.title,
          description: event.description || "",
          eventDate: eventDateOnly,
          eventTime: eventTimeOnly,
          eventType: event.eventType,
        });

        // Load dynamic fields if they exist
        if (event.dynamicFields) {
          setDynamicFields(event.dynamicFields);
        }

        // Load reminder settings
        if (event.reminders && event.reminders.length > 0) {
          const days = event.reminders.map((r: any) => r.daysBefore);
          const methods = [
            ...new Set(event.reminders.map((r: any) => r.method)),
          ];
          setSelectedReminderDays(days);
          setSelectedReminderMethods(methods);
        }
      } else {
        toast({
          title: "خطا در بارگذاری رویداد",
          description: response.message || "رویداد یافت نشد",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error loading event:", error);
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید",
        variant: "destructive",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const loadSubscriptionData = async () => {
    try {
      const response = await apiService.getCurrentSubscription();
      if (response.success) {
        setUserSubscription(response.data);
      }
    } catch (error) {
      console.error("Error loading subscription:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (errors[e.target.name]) {
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: "",
      }));
    }
  };

  const handleReminderDayToggle = (days: number) => {
    setSelectedReminderDays((prev) =>
      prev.includes(days)
        ? prev.filter((d) => d !== days)
        : [...prev, days].sort((a, b) => a - b),
    );
  };

  const handleReminderMethodToggle = (method: string) => {
    const methodData = reminderMethods.find((m) => m.value === method);

    // Check if method is premium and user doesn't have premium
    if (!methodData?.free && userSubscription?.currentType === "FREE") {
      toast({
        title: "نیاز به حساب پرمیوم",
        description: `برای اس��فاده از ${methodData?.label} نیاز به ارتقا به حساب پرمیوم دارید`,
        variant: "destructive",
      });
      return;
    }

    setSelectedReminderMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method],
    );
  };

  const handleEventTypeChange = (newEventType: string) => {
    setFormData((prev) => ({ ...prev, eventType: newEventType }));
    // Clear dynamic fields when event type changes
    setDynamicFields({});
  };

  const handleDynamicFieldChange = (key: string, value: string) => {
    setDynamicFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "عنوان رویداد الزامی است";
    }

    if (!formData.eventDate) {
      newErrors.eventDate = "تاریخ رویداد الزامی است";
    }

    if (selectedReminderDays.length === 0) {
      newErrors.reminderDays = "ح��اقل یک روز یادآوری انتخاب کنید";
    }

    if (selectedReminderMethods.length === 0) {
      newErrors.reminderMethods = "حداقل یک روش یادآوری انتخاب کنید";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.updateEvent(id!, {
        title: formData.title,
        description: formData.description,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime || "09:00",
        eventType: formData.eventType,
        reminderDays: selectedReminderDays,
        reminderMethods: selectedReminderMethods,
      });

      if (response.success) {
        toast({
          title: "✅ رویداد بروزرسانی شد",
          description: "رویداد با موفقیت بروزرسانی شد",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      } else {
        toast({
          title: "خطا در بروزرسانی رویداد",
          description: response.message || "لطفاً دوباره تلاش کنید",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Update event error:", error);
      toast({
        title: "خطا در بروزرسانی رویداد",
        description: "خطا در ارتباط با سرور",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری رویداد...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-brand-50 to-white"
      dir="rtl"
    >
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به داشبورد
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              ویرایش رویداد
            </span>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-brand-100">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Save className="w-6 h-6 text-brand-600" />
                ویرایش رویداد
              </CardTitle>
              <CardDescription>
                اطلاعات رویداد و یادآوری‌هایتان را ویرایش کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان رویداد *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      errors.title
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="مثال: تمدید بیمه خودرو"
                    required
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Event Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    توضیحات (اختیاری)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="جزئیات بیشتر در مورد رویداد..."
                    rows={3}
                  />
                </div>

                {/* Event Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاریخ رویداد *
                    </label>
                    <PersianCalendarPicker
                      value={formData.eventDate}
                      onChange={(date) =>
                        setFormData((prev) => ({ ...prev, eventDate: date }))
                      }
                      placeholder="انتخاب تاریخ رویداد"
                      className={errors.eventDate ? "border-red-500" : ""}
                      name="eventDate"
                      required
                    />
                    {errors.eventDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.eventDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ساعت رویداد (اختیاری)
                    </label>
                    <input
                      type="time"
                      name="eventTime"
                      value={formData.eventTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      در صورت عدم انتخاب، ساعت فعلی حفظ می‌شود
                    </p>
                  </div>
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع رویداد
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {eventTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleEventTypeChange(type.value)}
                        className={`p-3 border-2 rounded-lg text-center transition-colors ${
                          formData.eventType === type.value
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-sm font-medium">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Fields based on Event Type */}
                {getDynamicFields(formData.eventType).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اطلاعات تکمیلی (اختیاری)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getDynamicFields(formData.eventType).map((field) => (
                        <div key={field.key}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {field.label}
                          </label>
                          <input
                            type="text"
                            value={dynamicFields[field.key] || ""}
                            onChange={(e) =>
                              handleDynamicFieldChange(
                                field.key,
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                            placeholder={field.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      این اطلاعات اختیاری هستند و به شما در یادآوری رویداد کمک
                      می‌کنند
                    </p>
                  </div>
                )}

                {/* Reminder Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    زمان‌های یادآوری *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {reminderDaysOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleReminderDayToggle(option.value)}
                        className={`p-3 border-2 rounded-lg text-center transition-colors ${
                          selectedReminderDays.includes(option.value)
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-center mb-1">
                          {selectedReminderDays.includes(option.value) ? (
                            <Check className="w-4 h-4 text-brand-600" />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          {option.label}
                        </div>
                      </button>
                    ))}
                  </div>
                  {errors.reminderDays && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.reminderDays}
                    </p>
                  )}
                </div>

                {/* Reminder Methods */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    روش‌های یادآوری *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {reminderMethods.map((method) => {
                      const isSelected = selectedReminderMethods.includes(
                        method.value,
                      );
                      const isPremiumOnly = !method.free;
                      const hasAccess =
                        method.free || userSubscription?.currentType !== "FREE";

                      return (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() =>
                            handleReminderMethodToggle(method.value)
                          }
                          disabled={!hasAccess}
                          className={`p-4 border-2 rounded-lg text-center transition-colors relative ${
                            isSelected
                              ? "border-brand-500 bg-brand-50 text-brand-700"
                              : hasAccess
                                ? "border-gray-200 hover:border-gray-300"
                                : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {isPremiumOnly && !hasAccess && (
                            <div className="absolute top-1 left-1">
                              <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white">👑</span>
                              </div>
                            </div>
                          )}
                          <div className="text-2xl mb-2">{method.icon}</div>
                          <div className="text-sm font-medium">
                            {method.label}
                          </div>
                          {isPremiumOnly && (
                            <div className="text-xs text-gray-500 mt-1">
                              پرمیوم
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute top-1 right-1">
                              <Check className="w-4 h-4 text-brand-600" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.reminderMethods && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.reminderMethods}
                    </p>
                  )}
                  {userSubscription?.currentType === "FREE" && (
                    <p className="text-sm text-gray-600 mt-2">
                      برای استفاده از پیامک و واتس‌اپ،{" "}
                      <Link to="/premium" className="text-brand-600">
                        حساب خود را ارتقا دهید
                      </Link>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-brand-600 hover:bg-brand-700 py-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        در حال بروزرسانی...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 ml-1" />
                        بروزرسانی رویداد
                      </>
                    )}
                  </Button>
                  <Link to="/dashboard">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-6 py-3"
                    >
                      <X className="w-4 h-4 ml-1" />
                      انصراف
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
