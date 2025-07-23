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
import { ArrowRight, Users, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

interface FormErrors {
  name?: string;
  description?: string;
}

export default function CreateTeam() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "نام تیم الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await apiService.createTeam({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      });

      if (response.success) {
        toast({
          title: "✅ تیم ایجاد شد",
          description: `تیم "${formData.name}" با موفقیت ایجاد شد`,
        });

        // Redirect to team management
        navigate("/team");
      } else {
        // Handle validation errors from server
        if (response.errors) {
          const serverErrors: FormErrors = {};
          response.errors.forEach((error: any) => {
            serverErrors[error.field as keyof FormErrors] = error.message;
          });
          setErrors(serverErrors);
        } else {
          toast({
            title: "خطا در ایجاد تیم",
            description: response.message || "لطفاً دوباره تلاش کنید",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Create team error:", error);
      toast({
        title: "خطا در ایجاد تیم",
        description: "خطا در ارتباط با سرور",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/team"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
            >
              <ArrowRight className="w-4 h-4" />
              بازگشت به مدیریت تیم
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                ایجاد تیم جدید
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                اطلاعات تیم
              </CardTitle>
              <CardDescription>
                برای ایجاد تیم، اطلاعات زیر را تکمیل کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    نام تیم <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="نام تیم خود را وارد کنید"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">توضیحات (اختیاری)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="توضیحی در مورد تیم خود بنویسید..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        در حال ایجاد...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 ml-1" />
                        ایجاد تیم
                      </>
                    )}
                  </Button>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">
                      💡 نکته مهم
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• شما به عنوان مالک تیم تعریف خواهید شد</li>
                      <li>• می‌توانید اعضای جدید را دعوت کنید</li>
                      <li>
                        ��� تمام اعضا می‌توانند رویدادهای تیم را مشاهده کنند
                      </li>
                      <li>
                        • تنها مالک و ادمین‌ها می‌توانند اعضا را مدیریت کنند
                      </li>
                    </ul>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
