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
  role: "ADMIN" | "MEMBER" | "VIEWER";
  status: "ACTIVE" | "PENDING" | "INACTIVE";
  joinedAt: string;
  lastActiveAt?: string;
}

const STORAGE_KEY = "team_members_data";

// Default team members
const defaultTeamMembers: TeamMember[] = [
  {
    id: "1",
    fullName: "فرناد باباپور",
    email: "farnadadmin@gmail.com",
    role: "ADMIN",
    status: "ACTIVE",
    joinedAt: "2024-01-01T00:00:00Z",
    lastActiveAt: "2024-01-20T10:30:00Z",
  },
];

export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    fullName: "",
    role: "MEMBER" as "ADMIN" | "MEMBER" | "VIEWER",
  });
  const [user, setUser] = useState<any>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Load team members from localStorage
  const loadTeamMembersFromStorage = (): TeamMember[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return defaultTeamMembers;
    } catch (error) {
      console.error("Error loading team members from storage:", error);
      return defaultTeamMembers;
    }
  };

  // Save team members to localStorage
  const saveTeamMembersToStorage = (members: TeamMember[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    } catch (error) {
      console.error("Error saving team members to storage:", error);
    }
  };

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

      const userResponse = await apiService.getCurrentUser();

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

      // Load team members from localStorage
      const members = loadTeamMembersFromStorage();
      setTeamMembers(members);
    } catch (error) {
      console.error("Error loading team data:", error);
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "لطفاً صفح�� را مجدداً بارگذاری کنید",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      saveTeamMembersToStorage(teamMembers);
      toast({
        title: "تغییرات ذخیره شد",
        description: "تمام تغییرات با موفقیت ذخیره شدند",
      });
    } catch (error) {
      toast({
        title: "خطا در ذخیره",
        description: "خطا در ذخیره تغییرات",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

    // Check if email already exists
    if (teamMembers.some((member) => member.email === inviteForm.email)) {
      toast({
        title: "ایمیل تکراری",
        description: "این ایمیل قبلاً در تیم وجود دارد",
        variant: "destructive",
      });
      return;
    }

    try {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        fullName: inviteForm.fullName,
        email: inviteForm.email,
        role: inviteForm.role,
        status: "PENDING",
        joinedAt: new Date().toISOString(),
      };

      const updatedMembers = [...teamMembers, newMember];
      setTeamMembers(updatedMembers);
      saveTeamMembersToStorage(updatedMembers);

      setInviteForm({ email: "", fullName: "", role: "MEMBER" });
      setInviteDialogOpen(false);

      toast({
        title: "عضو جدید اضافه شد",
        description: `${inviteForm.fullName} به تیم اضافه شد`,
      });
    } catch (error) {
      toast({
        title: "خطا در افزودن عضو",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setEditDialogOpen(true);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingMember) return;

    try {
      const updatedMembers = teamMembers.map((member) =>
        member.id === editingMember.id ? editingMember : member,
      );

      setTeamMembers(updatedMembers);
      saveTeamMembersToStorage(updatedMembers);
      setEditDialogOpen(false);
      setEditingMember(null);

      toast({
        title: "عضو به‌روزرسانی شد",
        description: "اطلاعات عضو با موفقیت به‌روزرسانی شد",
      });
    } catch (error) {
      toast({
        title: "خطا در به‌روزرسانی",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const updatedMembers = teamMembers.filter(
        (member) => member.id !== memberId,
      );
      setTeamMembers(updatedMembers);
      saveTeamMembersToStorage(updatedMembers);

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

  const handleToggleStatus = (memberId: string) => {
    const updatedMembers = teamMembers.map((member) => {
      if (member.id === memberId) {
        const newStatus = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        return { ...member, status: newStatus };
      }
      return member;
    });

    setTeamMembers(updatedMembers);
    saveTeamMembersToStorage(updatedMembers);

    toast({
      title: "وضعیت تغییر کرد",
      description: "وضعیت عضو با موفقیت تغییر کرد",
    });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { label: "مدیر", color: "bg-red-100 text-red-800" },
      MEMBER: { label: "عضو", color: "bg-brand-100 text-brand-800" },
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
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                مدیریت تیم
              </span>
              <Badge className="bg-brand-100 text-brand-800">
                <Crown className="w-3 h-3 ml-1" />
                کسب‌وکار
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveChanges}
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 ml-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 ml-1" />
              )}
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            تغییرات شما به صورت خودکار در مرورگر ذخیره می‌شوند
          </p>
        </div>

        {/* Team Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                کل اعضا
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-600">
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
                اعضای فعال
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {teamMembers.filter((m) => m.status === "ACTIVE").length}
              </div>
              <p className="text-sm text-gray-600">آماده کار</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserX className="w-5 h-5 text-yellow-600" />
                در انتظار
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
              <Dialog
                open={inviteDialogOpen}
                onOpenChange={setInviteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-brand-600 hover:bg-brand-700">
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
                        <Plus className="w-4 h-4 ml-1" />
                        افزودن عضو
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
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-brand-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white font-bold">
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
                            "fa-IR",
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        {member.role !== "ADMIN" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMember(member)}
                              className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(member.id)}
                              className={
                                member.status === "ACTIVE"
                                  ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                  : "text-green-600 hover:text-green-700 hover:bg-green-50"
                              }
                            >
                              {member.status === "ACTIVE" ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </Button>
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
                                  <AlertDialogTitle>
                                    حذف عضو از تیم
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    آیا مطمئن هستید که می‌خواهید{" "}
                                    {member.fullName} را از تیم حذف کنید؟ این
                                    عمل قابل بازگشت نیست.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>انصراف</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleRemoveMember(member.id)
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    حذف عضو
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
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
                    className="bg-brand-600 hover:bg-brand-700"
                  >
                    <Plus className="w-4 h-4 ml-1" />
                    دعوت عضو جدید
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Member Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>ویرایش اطلاعات عضو</DialogTitle>
              <DialogDescription>اطلاعات عضو را ویرایش کنید</DialogDescription>
            </DialogHeader>
            {editingMember && (
              <form onSubmit={handleUpdateMember} className="space-y-4">
                <div>
                  <Label htmlFor="editFullName">نام کامل</Label>
                  <Input
                    id="editFullName"
                    value={editingMember.fullName}
                    onChange={(e) =>
                      setEditingMember((prev) =>
                        prev
                          ? {
                              ...prev,
                              fullName: e.target.value,
                            }
                          : null,
                      )
                    }
                    placeholder="نام و نام خانوادگی"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editEmail">ایمیل</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editingMember.email}
                    onChange={(e) =>
                      setEditingMember((prev) =>
                        prev
                          ? {
                              ...prev,
                              email: e.target.value,
                            }
                          : null,
                      )
                    }
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editRole">نقش</Label>
                  <Select
                    value={editingMember.role}
                    onValueChange={(value) =>
                      setEditingMember((prev) =>
                        prev
                          ? {
                              ...prev,
                              role: value as "ADMIN" | "MEMBER" | "VIEWER",
                            }
                          : null,
                      )
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
                      <SelectItem value="ADMIN">مدیر - دسترسی کامل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    <Save className="w-4 h-4 ml-1" />
                    ذخیره تغییرات
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                  >
                    انصراف
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Team Features */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card className="border-brand-200 bg-brand-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-900">
                <Calendar className="w-5 h-5" />
                تقویم مشترک تیم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-brand-700 mb-4">
                مشاهده رویدادهای تمام اعضای تیم در یک تقویم واحد
              </p>
              <Button
                variant="outline"
                className="border-brand-600 text-brand-600 hover:bg-brand-100"
                onClick={() => {
                  toast({
                    title: "🔧 در حال توسعه",
                    description: "تقویم مشترک تیم به زودی اضافه می‌شود",
                  });
                }}
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
                onClick={() => {
                  toast({
                    title: "🔧 در حال توسعه",
                    description: "گزارش‌گیری تیم به زودی اضافه می‌شود",
                  });
                }}
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
