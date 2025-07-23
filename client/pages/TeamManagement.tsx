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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Save,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  joinedAt: string | null;
  createdAt: string;
}

interface TeamInfo {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner: {
    id: string;
    fullName: string;
    email: string;
  };
  members: Array<{
    id: string;
    fullName: string;
    email: string;
    createdAt: string;
  }>;
  memberships: Array<{
    id: string;
    role: string;
    isActive: boolean;
    joinedAt: string | null;
    user: {
      id: string;
      fullName: string;
      email: string;
    };
  }>;
}

export default function TeamManagement() {
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviteLoading, setInviteLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadTeamInfo();
  }, []);

  const loadTeamInfo = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      if (!apiService.isAuthenticated()) {
        navigate("/login");
        return;
      }

      const response = await apiService.getTeamInfo();
      
      if (response.success) {
        setTeam(response.data.team);
      } else {
        toast({
          title: "خطا در بارگذاری اطلاعات تیم",
          description: response.message || "لطفاً دوباره تلاش کنید",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading team info:", error);
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "خطا",
        description: "لطفاً ایمیل عضو جدید را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    try {
      setInviteLoading(true);

      const response = await apiService.inviteTeamMember({
        email: inviteEmail.trim(),
        role: inviteRole as any,
      });

      if (response.success) {
        toast({
          title: "عضو اضافه شد",
          description: `${inviteEmail} با موفقیت به تیم اضافه شد`,
        });
        setInviteEmail("");
        setInviteOpen(false);
        loadTeamInfo(); // Reload team data
      } else {
        toast({
          title: "خطا در اضافه کردن عضو",
          description: response.message || "لطفاً دوباره تلاش کنید",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      toast({
        title: "خطا در اضافه کردن عضو",
        description: "خطا در ارتباط با سرور",
        variant: "destructive",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      const response = await apiService.removeTeamMember(memberId);

      if (response.success) {
        toast({
          title: "عضو حذف شد",
          description: `${memberName} از تیم حذف شد`,
        });
        loadTeamInfo(); // Reload team data
      } else {
        toast({
          title: "خطا در حذف عضو",
          description: response.message || "لطفاً دوباره تلاش کنید",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "خطا در حذف عضو",
        description: "خطا در ارتباط با سرور",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; color: string; icon: any }> = {
      OWNER: { label: "مالک", color: "bg-red-100 text-red-800", icon: Crown },
      ADMIN: { label: "ادمین", color: "bg-blue-100 text-blue-800", icon: Shield },
      MEMBER: { label: "عضو", color: "bg-green-100 text-green-800", icon: UserCheck },
      VIEWER: { label: "مشاهده‌گر", color: "bg-gray-100 text-gray-800", icon: Eye },
    };

    const roleInfo = roleMap[role] || roleMap.MEMBER;
    const IconComponent = roleInfo.icon;

    return (
      <Badge className={`${roleInfo.color} gap-1`}>
        <IconComponent className="w-3 h-3" />
        {roleInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری اطلاعات تیم...</p>
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
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                مدیریت تیم
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!team ? (
          /* No Team - Create Team */
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="w-6 h-6" />
                ایجاد تیم
              </CardTitle>
              <CardDescription>
                برای استفاده از امکانات تیمی، ابتدا تیم خود را ایجاد کنید
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                شما هنوز تیمی ایجاد نکرده‌اید. با ایجاد تیم می‌توانید اعضا را دعوت کنید و به صورت مشترک رویدادها را مدیریت کنید.
              </p>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  toast({
                    title: "🔧 در حال توسعه",
                    description: "ایجاد تیم به زودی فعال می‌شود",
                  });
                }}
              >
                <Plus className="w-4 h-4 ml-1" />
                ایجاد تیم
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Team Exists - Show Management */
          <div className="space-y-6">
            {/* Team Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {team.name}
                    </CardTitle>
                    {team.description && (
                      <CardDescription className="mt-1">
                        {team.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadTeamInfo}
                    >
                      <RefreshCw className="w-4 h-4 ml-1" />
                      بروزرسانی
                    </Button>
                    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700">
                          <Plus className="w-4 h-4 ml-1" />
                          دعوت عضو
                        </Button>
                      </DialogTrigger>
                      <DialogContent dir="rtl">
                        <DialogHeader>
                          <DialogTitle>دعوت عضو جدید</DialogTitle>
                          <DialogDescription>
                            ایمیل شخص مورد نظر و نقش او را در تیم انتخاب کنید
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="invite-email">ایمیل</Label>
                            <Input
                              id="invite-email"
                              type="email"
                              placeholder="email@example.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="invite-role">نقش</Label>
                            <Select value={inviteRole} onValueChange={setInviteRole}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">ادمین</SelectItem>
                                <SelectItem value="MEMBER">عضو</SelectItem>
                                <SelectItem value="VIEWER">مشاهده‌گر</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleInviteMember}
                            disabled={inviteLoading}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {inviteLoading ? (
                              <RefreshCw className="w-4 h-4 ml-1 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4 ml-1" />
                            )}
                            ارسال دعوت‌نامه
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      {team.memberships.length}
                    </p>
                    <p className="text-sm text-gray-600">کل اعضا</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {team.memberships.filter(m => m.isActive).length}
                    </p>
                    <p className="text-sm text-gray-600">اعضای فعال</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {team.memberships.filter(m => m.joinedAt).length}
                    </p>
                    <p className="text-sm text-gray-600">عضو شده</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members List */}
            <Card>
              <CardHeader>
                <CardTitle>اعضای تیم</CardTitle>
                <CardDescription>
                  مدیریت اعضای تیم و نقش‌های آن‌ها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {team.memberships.map((membership) => (
                    <div
                      key={membership.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{membership.user.fullName}</h3>
                          <p className="text-sm text-gray-500">{membership.user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getRoleBadge(membership.role)}
                            {membership.joinedAt ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <UserCheck className="w-3 h-3 ml-1" />
                                عضو شده
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                <Mail className="w-3 h-3 ml-1" />
                                دعوت شده
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {membership.role !== "OWNER" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent dir="rtl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف عضو از تیم</AlertDialogTitle>
                                <AlertDialogDescription>
                                  آیا از حذف {membership.user.fullName} از تیم اطمینان دارید؟
                                  این عمل قابل بازگشت نیست.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>انصراف</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(membership.user.id, membership.user.fullName)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  حذف عضو
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>دسترسی سریع</CardTitle>
                <CardDescription>
                  عملیات مرتبط با تیم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link to="/team/calendar">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex-col gap-2"
                    >
                      <Calendar className="w-6 h-6" />
                      تقویم تیم
                    </Button>
                  </Link>
                  <Link to="/team/reports">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex-col gap-2"
                    >
                      <Eye className="w-6 h-6" />
                      گزارش‌های تیم
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full h-20 flex-col gap-2"
                    onClick={() => {
                      toast({
                        title: "🔧 در حال توسعه",
                        description: "تنظیمات تیم به زودی اضافه می‌شود",
                      });
                    }}
                  >
                    <Edit className="w-6 h-6" />
                    تنظیمات تیم
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
