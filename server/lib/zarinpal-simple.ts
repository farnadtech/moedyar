export interface PaymentRequest {
  amount: number; // In Rials
  description: string;
  callbackUrl: string;
  email?: string;
  mobile?: string;
}

export interface PaymentResponse {
  status: number;
  authority: string;
  url: string;
}

export interface VerifyResponse {
  status: number;
  refId?: string;
}

const ZARINPAL_REQUEST_URL =
  "https://api.zarinpal.com/pg/v4/payment/request.json";
const ZARINPAL_VERIFY_URL =
  "https://api.zarinpal.com/pg/v4/payment/verify.json";
const ZARINPAL_PAYMENT_URL = "https://www.zarinpal.com/pg/StartPay/";

export async function requestPayment(
  paymentData: PaymentRequest,
): Promise<PaymentResponse> {
  try {
    const merchantId =
      process.env.ZARINPAL_MERCHANT_ID ||
      "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";

    // For development/testing, return a mock successful response
    if (
      process.env.NODE_ENV === "development" &&
      (merchantId === "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" ||
        process.env.ZARINPAL_SANDBOX === "true")
    ) {
      console.log("🧪 ZarinPal sandbox mode - returning mock payment URL");

      const mockAuthority = "A" + Date.now().toString();
      const subscriptionId = paymentData.callbackUrl.split("subscription=")[1];

      // Create a proper sandbox payment URL that will redirect back to verify
      return {
        status: 100,
        authority: mockAuthority,
        url: `${paymentData.callbackUrl}&Authority=${mockAuthority}&Status=OK`,
      };
    }

    const requestBody = {
      merchant_id: merchantId,
      amount: paymentData.amount,
      callback_url: paymentData.callbackUrl,
      description: paymentData.description,
      metadata: {
        email: paymentData.email,
        mobile: paymentData.mobile,
      },
    };

    console.log("ZarinPal request:", requestBody);

    const response = await fetch(ZARINPAL_REQUEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log("ZarinPal response:", result);

    if (result.data && result.data.code === 100) {
      return {
        status: result.data.code,
        authority: result.data.authority,
        url: ZARINPAL_PAYMENT_URL + result.data.authority,
      };
    } else {
      throw new Error(
        `Payment request failed with code: ${result.data?.code || "unknown"}, message: ${result.data?.message || "unknown error"}`,
      );
    }
  } catch (error) {
    console.error("ZarinPal payment request error:", error);
    throw error;
  }
}

export async function verifyPayment(
  authority: string,
  amount: number,
): Promise<VerifyResponse> {
  try {
    const merchantId =
      process.env.ZARINPAL_MERCHANT_ID ||
      "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";

    // For development/testing, return a mock successful response
    if (
      process.env.NODE_ENV === "development" &&
      (merchantId === "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" ||
        process.env.ZARINPAL_SANDBOX === "true")
    ) {
      console.log("🧪 ZarinPal sandbox mode - returning mock verification");

      return {
        status: 100,
        refId: "TEST" + Date.now().toString(),
      };
    }

    const requestBody = {
      merchant_id: merchantId,
      amount: amount,
      authority: authority,
    };

    const response = await fetch(ZARINPAL_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    return {
      status: result.data?.code || result.Status,
      refId: result.data?.ref_id || result.RefID,
    };
  } catch (error) {
    console.error("ZarinPal verification error:", error);
    throw error;
  }
}

export function getPaymentStatusMessage(status: number): string {
  const statusMessages: Record<number, string> = {
    100: "تراکنش با موفقیت انجام شد",
    101: "تراکنش قبلاً تایید شده است",
    "-9": "خطای اعتبارسنجی",
    "-10": "ترمینال فعال نمی‌باشد",
    "-11": "تلاش بیش از حد در بازه زمانی کوتاه",
    "-12": "شناسه قابل قبول نمی‌باشد",
    "-21": "هیچ نوع عملیات مالی برای این تراکنش تعریف نشده",
    "-22": "تراکنش ناموفق",
    "-33": "رقم تراکنش با رقم پرداخت شده مطابقت ندارد",
    "-34": "سقف تقسیم تراکنش از لحاظ تعداد یا رقم عبور کرده",
    "-40": "اجازه دسترسی به متد مربوطه وجود ندارد",
    "-41": "اطلاعات ارسال شده مربوط به Additional Data غیر معتبر می‌باشد",
    "-42":
      "مدت زمان معتبر طول عمر شناسه پرداخت بایستی بین 30 دقیقه تا 45 روز مشخص گردد",
    "-54": "درخواست مورد نظر یافت نشد",
  };

  return statusMessages[status] || `خطای ناشناخته (کد: ${status})`;
}
