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
import Premium from "./pages/Premium";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import AdminTransactions from "./pages/AdminTransactions";
import AdminSettings from "./pages/AdminSettings";
import AdminSetup from "./pages/AdminSetup";
import ApiTest from "./pages/ApiTest";
import Placeholder from "./pages/Placeholder";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
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

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/add-event" element={
              <ProtectedRoute>
                <AddEvent />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute>
                <AdminEvents />
              </ProtectedRoute>
            } />
            <Route path="/admin/transactions" element={
              <ProtectedRoute>
                <AdminTransactions />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/setup" element={
              <ProtectedRoute>
                <AdminSetup />
              </ProtectedRoute>
            } />
            <Route path="/api-test" element={
              <ProtectedRoute>
                <ApiTest />
              </ProtectedRoute>
            } />

            <Route path="/premium" element={<Premium />} />
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
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
