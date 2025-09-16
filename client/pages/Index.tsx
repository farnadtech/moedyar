import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Star,
  TrendingUp,
  Shield,
  Truck,
  Headphones,
  ArrowLeft,
  Menu,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        {/* Top bar */}
        <div className="bg-gray-50 py-2 text-sm">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">فروش در موعدیار</span>
              <span className="text-gray-600">سوالات متداول</span>
              <span className="text-gray-600">ثبت نام در خبرنامه</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>ارسال به تهران</span>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">م</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">موعدیار</h1>
                <p className="text-xs text-gray-500">مارکتپلیس آنلاین</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="جستجو در میان میلیون‌ها کالا..."
                  className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 px-6">
                  جستجو
                </Button>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              <Link to="/login" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                <User className="w-5 h-5" />
                <span>ورود | ثبت‌نام</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <button className="relative p-2 text-gray-700 hover:text-blue-600">
                <Heart className="w-6 h-6" />
              </button>
              <button className="relative p-2 text-gray-700 hover:text-blue-600">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-1 -left-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-200">
          <div className="container mx-auto px-4">
            <nav className="flex items-center py-3">
              <button className="flex items-center gap-2 text-gray-700 hover:text-blue-600 ml-8">
                <Menu className="w-5 h-5" />
                <span>دسته‌بندی کالاها</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-8 text-sm">
                <Link to="/incredible-offers" className="text-red-600 font-medium hover:text-red-700">
                  پیشنهاد شگفت‌انگیز
                </Link>
                <Link to="/super-market" className="text-gray-700 hover:text-blue-600">
                  سوپرمارکت
                </Link>
                <Link to="/fashion" className="text-gray-700 hover:text-blue-600">
                  مد و پوشاک
                </Link>
                <Link to="/electronics" className="text-gray-700 hover:text-blue-600">
                  کالای دیجیتال
                </Link>
                <Link to="/home-kitchen" className="text-gray-700 hover:text-blue-600">
                  خانه و آشپزخانه
                </Link>
                <Link to="/beauty" className="text-gray-700 hover:text-blue-600">
                  زیبایی و سلامت
                </Link>
                <Link to="/books" className="text-gray-700 hover:text-blue-600">
                  کتاب و لوازم تحریر
                </Link>
                <Link to="/sport" className="text-gray-700 hover:text-blue-600">
                  ورزش و سفر
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-l from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                خرید آنلاین
                <span className="text-blue-600 block">آسان و مطمئن</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                بزرگترین مارکتپلیس آنلاین ایران با بیش از یک میلیون محصول اصل و با کیفیت از بهترین فروشندگان
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                    عضویت رایگان
                  </Button>
                </Link>
                <Link to="/seller-register">
                  <Button variant="outline" className="text-lg px-8 py-4 border-blue-600 text-blue-600 hover:bg-blue-50">
                    فروشنده شوید
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 rounded-lg p-4 aspect-square"></div>
                  <div className="bg-gray-100 rounded-lg p-4 aspect-square"></div>
                  <div className="bg-gray-100 rounded-lg p-4 aspect-square"></div>
                  <div className="bg-gray-100 rounded-lg p-4 aspect-square"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">ارسال سریع</h3>
                <p className="text-gray-600 text-sm">ارسال سریع در تهران و کرج</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">ضمانت اصالت</h3>
                <p className="text-gray-600 text-sm">تضمین اصالت تمام کالاها</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">پشتیبانی ۲۴/۷</h3>
                <p className="text-gray-600 text-sm">پشتیبانی در تمام ساعات روز</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-none">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">بهترین قیمت</h3>
                <p className="text-gray-600 text-sm">مقایسه قیمت و بهترین پیشنهادها</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              خرید بر اساس دسته‌بندی
            </h2>
            <p className="text-lg text-gray-600">
              از میان هزاران دسته‌بندی، دسته مورد نظر خود را انتخاب کنید
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {[
              { name: 'موبایل', icon: '📱' },
              { name: 'لپ‌تاپ', icon: '💻' },
              { name: 'پوشاک', icon: '👕' },
              { name: 'کتاب', icon: '📚' },
              { name: 'خانه', icon: '🏠' },
              { name: 'ورزش', icon: '⚽' },
              { name: 'زیبایی', icon: '💄' },
              { name: 'ابزار', icon: '🔧' },
            ].map((category, index) => (
              <Link key={index} to={`/category/${category.name}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              محصولات پیشنهادی
            </h2>
            <Link to="/products">
              <Button variant="outline" className="flex items-center gap-2">
                مشاهده همه
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <Card key={item} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-square bg-gray-100 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                    نام محصول شماره {item}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">(23)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-gray-900">
                        ۱۲۰,۰۰۰ تومان
                      </span>
                      <div className="text-sm text-gray-500 line-through">
                        ۱۵۰,۰۰۰ تومان
                      </div>
                    </div>
                    <div className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
                      ۲۰٪
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="py-16 bg-gradient-to-l from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-4">
              به خانواده فروشندگان موعدیار بپیوندید
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              با پیوستن به موعدیار، محصولات خود را به میلیون‌ها خریدار معرفی کنید و فروش آنلاین خود را افزایش دهید
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/seller-register">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                  ثبت‌نام فروشنده
                </Button>
              </Link>
              <Link to="/seller-info">
                <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-purple-600">
                  اطلاعات بیشتر
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">م</span>
                </div>
                <span className="text-xl font-bold">موعدیار</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                موعدیار، مارکتپلیس آنلاین پیشرو در ایران که با ارائه بهترین تجربه خرید آنلاین، پل ارتباطی میان فروشندگان و خریداران است.
              </p>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="font-semibold text-lg mb-4">خدمات مشتریان</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/contact" className="hover:text-white">تماس با ما</Link></li>
                <li><Link to="/faq" className="hover:text-white">سوالات متداول</Link></li>
                <li><Link to="/shipping" className="hover:text-white">راهنمای خرید</Link></li>
                <li><Link to="/returns" className="hover:text-white">رویه بازگرداندن کالا</Link></li>
                <li><Link to="/warranty" className="hover:text-white">ضمانت اصالت کالا</Link></li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h3 className="font-semibold text-lg mb-4">درباره موعدیار</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/about" className="hover:text-white">درباره ما</Link></li>
                <li><Link to="/careers" className="hover:text-white">فرصت‌های شغلی</Link></li>
                <li><Link to="/press" className="hover:text-white">اتاق خبر</Link></li>
                <li><Link to="/investors" className="hover:text-white">سرمایه‌گذاران</Link></li>
                <li><Link to="/sustainability" className="hover:text-white">پایداری</Link></li>
              </ul>
            </div>

            {/* Seller */}
            <div>
              <h3 className="font-semibold text-lg mb-4">فروشندگان</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link to="/seller-register" className="hover:text-white">فروش در موعدیار</Link></li>
                <li><Link to="/seller-guide" className="hover:text-white">راهنمای فروشندگان</Link></li>
                <li><Link to="/seller-rules" className="hover:text-white">قوانین فروشندگان</Link></li>
                <li><Link to="/seller-support" className="hover:text-white">پشتیبانی فروشندگان</Link></li>
                <li><Link to="/seller-academy" className="hover:text-white">آکادمی فروش</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-400">
                © ۱۴۰۳ موعدیار. تمامی حقوق محفوظ است.
              </p>
              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <Link to="/privacy" className="text-gray-400 hover:text-white">حریم خصوصی</Link>
                <Link to="/terms" className="text-gray-400 hover:text-white">شرایط استفاده</Link>
                <Link to="/cookies" className="text-gray-400 hover:text-white">کوکی‌ها</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
