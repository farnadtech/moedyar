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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  ArrowRight,
  Users,
  Plus,
  Edit,
  Trash2,
  Crown,
  Shield,
  Eye,
  UserCheck,
  UserX,
  Mail,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "MEMBER" | "VIEWER";
  status: "ACTIVE" | "PENDING" | "INACTIVE";
  joinedAt: string;
  lastActiveAt?: string;
}

export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    fullName: "",
    role: "MEMBER" as "ADMIN" | "MEMBER" | "VIEWER",
  });
  const [user, setUser] = useState<any>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Check authentication and subscription
      if (!apiService.isAuthenticated()) {
        navigate("/login");
        return;
      }

      const [userResponse, teamResponse] = await Promise.all([
        apiService.getCurrentUser(),
        // Mock team members for now - in real implementation this would be an API call
        Promise.resolve({
          success: true,
          data: {
            members: [
              {
                id: "1",
                fullName: "فرناد باباپور",
                email: "farnadadmin@gmail.com",
                role: "ADMIN",
                status: "ACTIVE",
                joinedAt: "2024-01-01T00:00:00Z",
                lastActiveAt: "2024-01-20T10:30:00Z",
              },
              {
                id: "2",
                fullName: "علی احمدی",
                email: "ali@company.com",
                role: "MEMBER",
                status: "ACTIVE",
                joinedAt: "2024-01-15T00:00:00Z",
                lastActiveAt: "2024-01-19T14:20:00Z",
              },
              {
                id: "3",
                fullName: "سارا محمدی",
                email: "sara@company.com",
                role: "VIEWER",
                status: "PENDING",
                joinedAt: "2024-01-18T00:00:00Z",
              },
            ] as TeamMember[],
          },
        }),
      ]);

      if (userResponse.success && userResponse.data) {
        const userData = userResponse.data.user;
        setUser(userData);

        // Check if user has business subscription
        if (userData.subscriptionType !== "BUSINESS") {
          toast({
            title: "دسترسی محدود",
            description: "مدیریت تیم تنها برای حساب‌های کسب‌وکار در دسترس است",
            variant: "destructive",
          });
          navigate("/premium");
          return;
        }
      }

      if (teamResponse.success && teamResponse.data) {
        setTeamMembers(teamResponse.data.members);
      }
    } catch (error) {
      console.error("Error loading team data:", error);
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteForm.email || !inviteForm.fullName || !inviteForm.role) {
      toast({
        title: "اطلاعات ناقص",
        description: "لطفاً تمام فیلدها را پر کنید",
        variant: "destructive",
      });
      return;
    }

    try {
      // Mock API call - in real implementation this would send an invitation
      const newMember: TeamMember = {
        id: Date.now().toString(),
        fullName: inviteForm.fullName,
        email: inviteForm.email,
        role: inviteForm.role,
        status: "PENDING",
        joinedAt: new Date().toISOString(),
      };

      setTeamMembers((prev) => [...prev, newMember]);
      setInviteForm({ email: "", fullName: "", role: "MEMBER" });
      setInviteDialogOpen(false);

      toast({
        title: "دعوت‌نامه ارسال شد",
        description: `دعوت‌نامه به ${inviteForm.email} ارسال شد`,
      });
    } catch (error) {
      toast({
        title: "خطا در ارسال دعوت‌نامه",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const confirmed = window.confirm(
      "آیا مطمئن هستید که می‌خواهید این عضو را از تیم حذف کنید؟"
    );

    if (!confirmed) return;

    try {
      setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
      toast({
        title: "عضو حذف شد",
        description: "عضو با موفقیت از تیم حذف شد",
      });
    } catch (error) {
      toast({
        title: "خطا در حذف عضو",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { label: "مدیر", color: "bg-red-100 text-red-800" },
      MEMBER: { label: "عضو", color: "bg-blue-100 text-blue-800" },
      VIEWER: { label: "بیننده", color: "bg-gray-100 text-gray-800" },
    };
    const config = roleConfig[role as keyof typeof roleConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: "فعال", color: "bg-green-100 text-green-800" },
      PENDING: { label: "در انتظار", color: "bg-yellow-100 text-yellow-800" },
      INACTIVE: { label: "غیرفعال", color: "bg-gray-100 text-gray-800" },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config.color}>{config.label}</Badge>;
  };

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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700"
            >
              <ArrowRight className="w-4 h-4" />
              بازگشت به داشبورد
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">مدیریت تیم</span>
              <Badge className="bg-purple-100 text-purple-800">
                <Crown className="w-3 h-3 ml-1" />
                کسب‌وکار
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Team Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                کل اعضا
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {teamMembers.length}
              </div>
              <p className="text-sm text-gray-600">
                {teamMembers.filter((m) => m.status === "ACTIVE").length} فعال
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                دعوت‌های در انتظار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {teamMembers.filter((m) => m.status === "PENDING").length}
              </div>
              <p className="text-sm text-gray-600">نیاز به تایید</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                مدیران
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {teamMembers.filter((m) => m.role === "ADMIN").length}
              </div>
              <p className="text-sm text-gray-600">دسترسی کامل</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  اعضای تیم
                </CardTitle>
                <CardDescription>
                  مدیریت اعضای تیم و سطوح دسترسی آن‌ها
                </CardDescription>
              </div>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 ml-1" />
                    دعوت عضو جدید
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle>دعوت عضو جدید</DialogTitle>
                    <DialogDescription>
                      اطلاعات عضو جدید را وارد کنید
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleInviteMember} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">نام کامل</Label>
                      <Input
                        id="fullName"
                        value={inviteForm.fullName}
                        onChange={(e) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder="نام و نام خانوادگی"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">ایمیل</Label>
                      <Input
                        id="email"
                        type="email"
                        value={inviteForm.email}
                        onChange={(e) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">نقش</Label>
                      <Select
                        value={inviteForm.role}
                        onValueChange={(value) =>
                          setInviteForm((prev) => ({
                            ...prev,
                            role: value as "ADMIN" | "MEMBER" | "VIEWER",
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب نقش" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VIEWER">
                            بیننده - مشاهده رویدادها
                          </SelectItem>
                          <SelectItem value="MEMBER">
                            عضو - ایجاد و ویرایش رویدادها
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            مدیر - دسترسی کامل
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        <Mail className="w-4 h-4 ml-1" />
                        ارسال دعوت‌نامه
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setInviteDialogOpen(false)}
                      >
                        انصراف
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {member.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {member.fullName}
                        </h3>
                        <p className="text-gray-600 text-sm">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleBadge(member.role)}
                          {getStatusBadge(member.status)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.status === "ACTIVE" && member.lastActiveAt && (
                        <div className="text-xs text-gray-500 text-left">
                          آخرین فعالیت:
                          <br />
                          {new Date(member.lastActiveAt).toLocaleDateString(
                            "fa-IR"
                          )}
                        </div>
                      )}
                      {member.role !== "ADMIN" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {teamMembers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">
                    هنوز عضوی ندارید
                  </h3>
                  <p className="text-gray-400 mb-4">
                    اولین عضو تیم خود را دعوت کنید
                  </p>
                  <Button
                    onClick={() => setInviteDialogOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    دعوت عضو جدید
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Features */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Calendar className="w-5 h-5" />
                تقویم مشترک تیم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 mb-4">
                مشاهده رویدادهای تمام اعضای تیم در یک تقویم واحد
              </p>
              <Button
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-100"
              >
                <Calendar className="w-4 h-4 ml-1" />
                مشاهده تقویم تیم
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Eye className="w-5 h-5" />
                گزارش‌گیری تیم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 mb-4">
                آمار و گزارش عملکرد اعضای تیم و رویدادهای مهم
              </p>
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-100"
              >
                <Eye className="w-4 h-4 ml-1" />
                مشاهده گزارش‌ها
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
