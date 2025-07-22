import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowRight, Search, Filter, FileText, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
  }, [currentPage, searchQuery, statusFilter]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      const response = await apiService.getAdminTransactions(currentPage, 20, searchQuery, statusFilter);

      if (response.success) {
        setTransactions(response.data.transactions);
        setPagination(response.data.pagination);
      } else {
        toast({
          title: "خطا در بارگذاری تراکنش‌ها",
          description: response.message,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "لطفاً صفحه را مجدداً بارگذاری کنید",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-800">فعال</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">غیرفعال</Badge>;
    }
  };

  const getSubscriptionTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      'FREE': { label: 'رایگان', color: 'bg-gray-100 text-gray-800' },
      'PREMIUM': { label: 'پرمیوم', color: 'bg-yellow-100 text-yellow-800' },
      'BUSINESS': { label: 'کسب‌وکار', color: 'bg-purple-100 text-purple-800' }
    };
    
    const typeConfig = types[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={typeConfig.color}>{typeConfig.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری تراکنش‌ها...</p>
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
            <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700">
              <ArrowRight className="w-4 h-4" />
              بازگشت به پنل ادمین
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">مدیریت تراکنش‌ها</span>
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
            <Button variant="default" className="bg-brand-600 hover:bg-brand-700">
              <CreditCard className="w-4 h-4 mr-2" />
              تراکنش‌ها
            </Button>
            <Link to="/admin/settings">
              <Button variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
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
                    placeholder="جستجو در شناسه پرداخت یا نام کاربر..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <div className="min-w-[150px]">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">همه وضعیت‌ها</option>
                  <option value="active">فعال</option>
                  <option value="inactive">غیرفعال</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>تراکنش‌های مالی</span>
              {pagination && (
                <span className="text-sm font-normal text-gray-600">
                  {pagination.total} تراکنش
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">هیچ تراکنشی یافت نشد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {formatCurrency(transaction.amount || 0)}
                          </h3>
                          {getSubscriptionTypeBadge(transaction.type)}
                          {getStatusBadge(transaction.isActive)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {transaction.user.fullName} ({transaction.user.email})
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(transaction.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">شناسه تراکنش:</span>
                          <p className="text-gray-800 font-mono text-xs break-all">
                            {transaction.id}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">شناسه پرداخت:</span>
                          <p className="text-gray-800 font-mono text-xs break-all">
                            {transaction.paymentId || 'نامشخص'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">تاریخ انقضا:</span>
                          <p className="text-gray-800">
                            {transaction.endDate ? formatDate(transaction.endDate) : 'نامحدود'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* User Subscription Info */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          وضعیت فعلی کاربر: {getSubscriptionTypeBadge(transaction.user.subscriptionType)}
                        </span>
                        <span className="text-gray-500">
                          تاریخ ثبت: {formatDate(transaction.createdAt)}
                        </span>
                      </div>
                    </div>
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
