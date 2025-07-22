const ZarinPal = require('zarinpal-checkout');

// Initialize ZarinPal
const zarinpal = ZarinPal.create(process.env.ZARINPAL_MERCHANT_ID || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', process.env.ZARINPAL_SANDBOX === 'true');

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

export async function requestPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
  try {
    const response = await zarinpal.PaymentRequest({
      Amount: paymentData.amount,
      CallbackURL: paymentData.callbackUrl,
      Description: paymentData.description,
      Email: paymentData.email,
      Mobile: paymentData.mobile,
    });

    if (response.status === 100) {
      return {
        status: response.status,
        authority: response.authority,
        url: response.url
      };
    } else {
      throw new Error(`Payment request failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('ZarinPal payment request error:', error);
    throw error;
  }
}

export async function verifyPayment(authority: string, amount: number): Promise<VerifyResponse> {
  try {
    const response = await zarinpal.PaymentVerification({
      Amount: amount,
      Authority: authority,
    });

    return {
      status: response.status,
      refId: response.RefID
    };
  } catch (error) {
    console.error('ZarinPal verification error:', error);
    throw error;
  }
}

export function getPaymentStatusMessage(status: number): string {
  const statusMessages: Record<number, string> = {
    100: 'تراکنش با موفقیت انجام شد',
    101: 'تراکنش قبلاً تایید شده است',
    '-9': 'خطای اعتبارسنجی',
    '-10': 'ترمینال فعال نمی‌باشد',
    '-11': 'تلاش بیش از حد در بازه زمانی کوتاه',
    '-12': 'شناسه قابل قبول نمی‌باشد',
    '-21': 'هیچ نوع عملیات مالی برای این ت��اکنش تعریف نشده',
    '-22': 'تراکنش ناموفق',
    '-33': 'رقم تراکنش با رقم پرداخت شده مطابقت ندارد',
    '-34': 'سقف تقسیم تراکنش از لحاظ تعداد یا رقم عبور کرده',
    '-40': 'اجازه دسترسی به متد مربوطه وجود ندارد',
    '-41': 'اطلاعات ارسال شده مربوط به Additional Data غیر معتبر می‌باشد',
    '-42': 'مدت زمان معتبر طول عمر شناسه پرداخت بایستی بین 30 دقیقه تا 45 روز مشخص گردد',
    '-54': 'درخواست مورد نظر یافت نشد'
  };

  return statusMessages[status] || `خطای ناشناخته (کد: ${status})`;
}
