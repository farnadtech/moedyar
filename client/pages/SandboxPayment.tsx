import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, CreditCard, ArrowLeft } from "lucide-react";

export default function SandboxPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const authority = searchParams.get("authority");
  const subscription = searchParams.get("subscription");
  const amount = searchParams.get("amount");
  const description = searchParams.get("description");

  const formatPrice = (price: string) => {
    const num = parseInt(price);
    return new Intl.NumberFormat("fa-IR").format(num);
  };

  const handlePaymentResult = async (status: "success" | "failed") => {
    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (status === "success") {
        // Redirect to verify endpoint with success status
        window.location.href = `/api/subscriptions/verify-payment?Authority=${authority}&Status=OK&subscription=${subscription}`;
      } else {
        // Redirect to verify endpoint with failed status
        window.location.href = `/api/subscriptions/verify-payment?Authority=${authority}&Status=NOK&subscription=${subscription}`;
      }
    } catch (error) {
      console.error("Payment simulation error:", error);
      navigate("/dashboard?payment=failed&reason=simulation_error");
    }
  };

  useEffect(() => {
    if (!authority || !subscription) {
      navigate("/dashboard?payment=failed&reason=invalid_params");
    }
  }, [authority, subscription, navigate]);

  if (!authority || !subscription) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="max-w-md w-full">
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="text-center bg-green-50 rounded-t-lg">
            <CardTitle className="text-2xl flex items-center justify-center gap-2 text-green-800">
              <CreditCard className="w-6 h-6" />
              درگاه پرداخت تست
            </CardTitle>
            <p className="text-sm text-green-600 mt-2">
              🧪 محیط آزمایشی - هیچ پول واقعی دریافت نمی‌شود
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Payment Details */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">
                  جزئیات پرداخت
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">توضیحات:</span>
                    <span className="font-medium">
                      {decodeURIComponent(description || "")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">مبلغ:</span>
                    <span className="font-bold text-lg text-green-600">
                      {formatPrice(amount || "0")} ریال
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">شناسه پرداخت:</span>
                    <span className="font-mono text-sm">{authority}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  📝 این صفحه برای تست درگاه پرداخت طراحی شده است. در محیط
                  واقعی، کاربران به صفحه زرین‌پال هدایت می‌شوند.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {!isProcessing ? (
              <div className="space-y-4">
                <Button
                  onClick={() => handlePaymentResult("success")}
                  className="w-full bg-green-600 hover:bg-green-700 py-3"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 ml-2" />
                  شبیه‌سازی پرداخت موفق
                </Button>

                <Button
                  onClick={() => handlePaymentResult("failed")}
                  variant="destructive"
                  className="w-full py-3"
                  size="lg"
                >
                  <XCircle className="w-5 h-5 ml-2" />
                  شبیه‌سازی پرداخت ناموفق
                </Button>

                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="w-full py-3"
                  size="lg"
                >
                  <ArrowLeft className="w-5 h-5 ml-2" />
                  انصراف و بازگشت
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">در حال پردازش پرداخت...</p>
                <p className="text-sm text-gray-500 mt-2">لطفاً منتظر بمانید</p>
              </div>
            )}

            <div className="text-center text-xs text-gray-500 border-t pt-4">
              محیط تست - زرین‌پال | رویداد یار
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
