import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function SandboxPayment() {
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(false);
  
  const authority = searchParams.get("authority");
  const subscription = searchParams.get("subscription");
  const amount = searchParams.get("amount");
  const description = searchParams.get("description");

  const handlePaymentSuccess = async () => {
    setProcessing(true);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Redirect to verification endpoint with success
    const callbackUrl = `/api/subscriptions/verify-payment?Authority=${authority}&Status=OK&subscription=${subscription}`;
    window.location.href = callbackUrl;
  };

  const handlePaymentFailure = async () => {
    setProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to verification endpoint with failure
    const callbackUrl = `/api/subscriptions/verify-payment?Authority=${authority}&Status=NOK&subscription=${subscription}`;
    window.location.href = callbackUrl;
  };

  if (!authority || !subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">خطا در پرداخت</CardTitle>
          </CardHeader>
          <CardContent>
            <p>پارامترهای پرداخت نامعتبر است.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center" dir="rtl">
      <Card className="w-full max-w-md border-2 border-blue-200">
        <CardHeader className="text-center bg-blue-50">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-blue-900">
            درگاه پرداخت آزمایشی
          </CardTitle>
          <CardDescription>
            🧪 این یک درگاه پرداخت شبیه‌ساز است
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">مبلغ:</span>
              <span className="font-bold text-lg">
                {parseInt(amount || "0").toLocaleString()} تومان
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">توضیحات:</span>
              <span className="text-sm">
                {decodeURIComponent(description || "")}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">شناسه تراکنش:</span>
              <span className="text-xs font-mono text-gray-500">
                {authority}
              </span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">
              ⚠️ حالت آزمایشی
            </h4>
            <p className="text-sm text-yellow-700">
              این یک درگاه پرداخت شبیه‌ساز است. هیچ پول واقعی از حساب شما کسر نمی‌شود.
              برای تست عملکرد پرداخت موفق یا ناموفق، روی دکمه‌های زیر کلیک کنید.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handlePaymentSuccess}
              disabled={processing}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  در حال پردازش...
                </div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 ml-1" />
                  پرداخت موفق (تست)
                </>
              )}
            </Button>
            
            <Button
              onClick={handlePaymentFailure}
              disabled={processing}
              variant="outline"
              className="w-full border-red-600 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 ml-1" />
              پرداخت ناموفق (تست)
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              💡 در حالت تولید، این صفحه با درگاه واقعی زرین‌پال جایگزین می‌شود
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
