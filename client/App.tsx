import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import RegisterPersonal from "./pages/RegisterPersonal";
import Dashboard from "./pages/Dashboard";
import AddEvent from "./pages/AddEvent";
import Settings from "./pages/Settings";
import Placeholder from "./pages/Placeholder";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPersonal />} />
          <Route path="/register/personal" element={<RegisterPersonal />} />
          <Route path="/register/business" element={
            <Placeholder
              title="ثبت نام حساب کسب‌وکار"
              description="حساب کسب‌وکار با قابلیت‌های پیشرفته مدیریت تیم"
              suggestion="برای دریافت اطلاعات بیشتر در مورد حساب کسب‌وکار و قیمت‌گذاری، با ما تماس بگیرید."
            />
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/premium" element={
            <Placeholder
              title="ارتقا به پرمیوم"
              description="دسترسی به تمام امکانات پیشرفته سیستم"
              suggestion="با درگاه زرین پال، امکان خرید آسان و امن پکیج پرمیوم."
            />
          } />
          <Route path="/add-event" element={
            <Placeholder
              title="افزودن رویداد جدید"
              description="فرم کامل ثبت رویداد با تنظیمات یادآوری"
            />
          } />
          <Route path="/demo" element={
            <Placeholder
              title="نمایش دمو"
              description="مشاهده ویدیوی آموزشی و تست سیستم"
            />
          } />
          <Route path="/contact" element={
            <Placeholder
              title="تماس با ما"
              description="راه‌های ارتباط و دریافت پشتیبانی"
            />
          } />
          <Route path="/support" element={
            <Placeholder
              title="پشتیبانی"
              description="مرکز کمک و پاسخ به سوالات متداول"
            />
          } />
          <Route path="/terms" element={
            <Placeholder
              title="شرایط استفاده"
              description="قوانین و مقررات استفاده از سرویس"
            />
          } />
          <Route path="/privacy" element={
            <Placeholder
              title="حریم خصوصی"
              description="نحوه جمع‌آوری و استفاده از اطلاعات کاربران"
            />
          } />
          <Route path="/forgot-password" element={
            <Placeholder
              title="بازیابی رمز عبور"
              description="فرم بازیابی رمز عبور از طریق ایمیل"
            />
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
