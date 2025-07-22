import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  ArrowRight,
  Mail,
  MessageSquare,
  CreditCard,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  TestTube,
  CheckCircle,
  AlertCircle,
  Zap,
  Users,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

interface SystemConfig {
  email: {
    user: string;
    password: string;
    service: string;
    enabled: boolean;
  };
  sms: {
    username: string;
    password: string;
    sender: string;
    enabled: boolean;
  };
  whatsapp: {
    apiKey: string;
    enabled: boolean;
  };
  zarinpal: {
    merchantId: string;
    sandbox: boolean;
    enabled: boolean;
  };
  app: {
    url: string;
    name: string;
    supportEmail: string;
  };
}

export default function AdminSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    email: { user: "", password: "", service: "gmail", enabled: false },
    sms: { username: "", password: "", sender: "", enabled: false },
    whatsapp: { apiKey: "", enabled: false },
    zarinpal: { merchantId: "", sandbox: true, enabled: false },
    app: { url: "", name: "رویداد یار", supportEmail: "" },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSystemConfig();

      if (response.success) {
        setConfig(response.data);
      } else {
        toast({
          title: "خطا در بارگذاری تنظیمات",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading config:", error);
      toast({
        title: "خطا در ارتباط با سرور",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (section?: string) => {
    try {
      setSaving(true);
      const response = await apiService.updateSystemConfig(config, section);

      if (response.success) {
        toast({
          title: "✅ تنظیمات ذخیره شد",
          description: section
            ? `بخش ${section} با موفقیت به‌روزرسانی شد`
            : "تمام تنظیمات ذخیره شد",
        });
      } else {
        toast({
          title: "خطا در ذخیره تنظیمات",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        title: "خطا در ذخیره",
        description: "خطا در ارتباط با سرور",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testService = async (
    service: "email" | "sms" | "whatsapp" | "zarinpal",
  ) => {
    try {
      setTesting(service);
      const response = await apiService.testSystemService(service);

      if (response.success) {
        toast({
          title: "✅ تست موفق",
          description: `سرویس ${getServiceName(service)} با موفقیت تست شد`,
        });
      } else {
        toast({
          title: "❌ تست ناموفق",
          description:
            response.message || `خطا در تست سرویس ${getServiceName(service)}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error testing ${service}:`, error);
      toast({
        title: "خطا در تست",
        description: "خطا در ارتباط با سرور",
        variant: "destructive",
      });
    } finally {
      setTesting(null);
    }
  };

  const getServiceName = (service: string) => {
    const names: Record<string, string> = {
      email: "ایمیل",
      sms: "پیامک",
      whatsapp: "واتس‌اپ",
      zarinpal: "زرین‌پال",
    };
    return names[service] || service;
  };

  const updateConfig = (
    section: keyof SystemConfig,
    key: string,
    value: any,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری تنظیمات...</p>
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
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                تنظیمات سیستم
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
            <Button
              variant="default"
              className="bg-brand-600 hover:bg-brand-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              تنظیمات سیستم
            </Button>
          </div>
        </div>

        <Tabs defaultValue="email" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              ایمیل
            </TabsTrigger>
            <TabsTrigger value="sms" className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              پیامک
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              واتس‌اپ
            </TabsTrigger>
            <TabsTrigger value="zarinpal" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              زرین‌پال
            </TabsTrigger>
            <TabsTrigger value="app" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              عمومی
            </TabsTrigger>
          </TabsList>

          {/* Email Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    تنظیمات ایمیل
                  </span>
                  <Badge
                    variant={config.email.enabled ? "default" : "secondary"}
                  >
                    {config.email.enabled ? "فعال" : "غیرفعال"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  پیکربندی سرویس ارسال ایمیل (Gmail توصیه می‌شود)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="email-enabled"
                    checked={config.email.enabled}
                    onChange={(e) =>
                      updateConfig("email", "enabled", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="email-enabled">فعال‌سازی ارسال ایمیل</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email-user">ایمیل فرستنده</Label>
                    <Input
                      id="email-user"
                      type="email"
                      placeholder="your-email@gmail.com"
                      value={config.email.user}
                      onChange={(e) =>
                        updateConfig("email", "user", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-service">سرویس ایمیل</Label>
                    <select
                      id="email-service"
                      value={config.email.service}
                      onChange={(e) =>
                        updateConfig("email", "service", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="gmail">Gmail</option>
                      <option value="yahoo">Yahoo</option>
                      <option value="outlook">Outlook</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="email-password">
                    رمز عبور یا App Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="email-password"
                      type={showPasswords ? "text" : "password"}
                      placeholder="رمز عبور ایمیل"
                      value={config.email.password}
                      onChange={(e) =>
                        updateConfig("email", "password", e.target.value)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    برای Gmail از App Password استفاده کنید
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => saveConfig("email")} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "در حال ذخیره..." : "ذخیره"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => testService("email")}
                    disabled={testing === "email" || !config.email.enabled}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testing === "email" ? "در حال تست..." : "تست ارسال"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Settings */}
          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    تنظیمات پیامک
                  </span>
                  <Badge variant={config.sms.enabled ? "default" : "secondary"}>
                    {config.sms.enabled ? "فعال" : "غیرفعال"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  پیکربندی سرویس ملی پیامک برای ارسال SMS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sms-enabled"
                    checked={config.sms.enabled}
                    onChange={(e) =>
                      updateConfig("sms", "enabled", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="sms-enabled">فعال‌سازی ارسال پیامک</Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sms-username">نام کاربری</Label>
                    <Input
                      id="sms-username"
                      placeholder="نام کاربری ملی پیامک"
                      value={config.sms.username}
                      onChange={(e) =>
                        updateConfig("sms", "username", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="sms-sender">شماره فرستنده</Label>
                    <Input
                      id="sms-sender"
                      placeholder="50004000"
                      value={config.sms.sender}
                      onChange={(e) =>
                        updateConfig("sms", "sender", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sms-password">رمز عبور</Label>
                  <Input
                    id="sms-password"
                    type={showPasswords ? "text" : "password"}
                    placeholder="رمز عبور ملی پیامک"
                    value={config.sms.password}
                    onChange={(e) =>
                      updateConfig("sms", "password", e.target.value)
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => saveConfig("sms")} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "در حال ذخیره..." : "ذخیره"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => testService("sms")}
                    disabled={testing === "sms" || !config.sms.enabled}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testing === "sms" ? "در حال تست..." : "تست ارسال"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp Settings */}
          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    تنظیمات واتس‌اپ
                  </span>
                  <Badge
                    variant={config.whatsapp.enabled ? "default" : "secondary"}
                  >
                    {config.whatsapp.enabled ? "فعال" : "غیرفعال"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  پیکربندی WhatsApp Business API (Twilio, MessageBird و...)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="whatsapp-enabled"
                    checked={config.whatsapp.enabled}
                    onChange={(e) =>
                      updateConfig("whatsapp", "enabled", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="whatsapp-enabled">
                    فعال‌سازی ارسال واتس‌اپ
                  </Label>
                </div>

                <div>
                  <Label htmlFor="whatsapp-api-key">API Key</Label>
                  <Input
                    id="whatsapp-api-key"
                    type={showPasswords ? "text" : "password"}
                    placeholder="کلید API سرویس واتس‌اپ"
                    value={config.whatsapp.apiKey}
                    onChange={(e) =>
                      updateConfig("whatsapp", "apiKey", e.target.value)
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    از سرویس‌هایی مثل Twilio، MessageBird استفاده کنید
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => saveConfig("whatsapp")}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "در حال ذخیره..." : "ذخیره"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => testService("whatsapp")}
                    disabled={
                      testing === "whatsapp" || !config.whatsapp.enabled
                    }
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testing === "whatsapp" ? "در حال تست..." : "تست ارسال"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ZarinPal Settings */}
          <TabsContent value="zarinpal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    تنظیمات زرین‌پال
                  </span>
                  <Badge
                    variant={config.zarinpal.enabled ? "default" : "secondary"}
                  >
                    {config.zarinpal.enabled ? "فعال" : "غیرفعال"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  پیکربندی درگاه پرداخت زرین‌پال
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="zarinpal-enabled"
                    checked={config.zarinpal.enabled}
                    onChange={(e) =>
                      updateConfig("zarinpal", "enabled", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="zarinpal-enabled">
                    فعال‌سازی درگاه پرداخت
                  </Label>
                </div>

                <div>
                  <Label htmlFor="zarinpal-merchant">Merchant ID</Label>
                  <Input
                    id="zarinpal-merchant"
                    type={showPasswords ? "text" : "password"}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={config.zarinpal.merchantId}
                    onChange={(e) =>
                      updateConfig("zarinpal", "merchantId", e.target.value)
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="zarinpal-sandbox"
                    checked={config.zarinpal.sandbox}
                    onChange={(e) =>
                      updateConfig("zarinpal", "sandbox", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="zarinpal-sandbox">حالت تست (Sandbox)</Label>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => saveConfig("zarinpal")}
                    disabled={saving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "در حال ذخیره..." : "ذخیره"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => testService("zarinpal")}
                    disabled={
                      testing === "zarinpal" || !config.zarinpal.enabled
                    }
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    {testing === "zarinpal" ? "در حال تست..." : "تست اتصال"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Settings */}
          <TabsContent value="app">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  تنظیمات عمومی برنامه
                </CardTitle>
                <CardDescription>تنظیمات کلی و URL های برنامه</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="app-name">نام برنامه</Label>
                    <Input
                      id="app-name"
                      placeholder="رویداد یار"
                      value={config.app.name}
                      onChange={(e) =>
                        updateConfig("app", "name", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="app-support-email">ایمیل پشتیبانی</Label>
                    <Input
                      id="app-support-email"
                      type="email"
                      placeholder="support@example.com"
                      value={config.app.supportEmail}
                      onChange={(e) =>
                        updateConfig("app", "supportEmail", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="app-url">URL برنامه</Label>
                  <Input
                    id="app-url"
                    placeholder="https://your-app.fly.dev"
                    value={config.app.url}
                    onChange={(e) => updateConfig("app", "url", e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    این URL در ایمیل‌ها و کال‌بک‌های پرداخت استفاده می‌شود
                  </p>
                </div>

                <Button onClick={() => saveConfig("app")} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "در حال ذخیره..." : "ذخیره"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save All Button */}
        <div className="flex justify-center mt-8">
          <Button
            size="lg"
            onClick={() => saveConfig()}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? "در حال ذخیره همه..." : "ذخیره همه تنظیمات"}
          </Button>
        </div>
      </div>
    </div>
  );
}
