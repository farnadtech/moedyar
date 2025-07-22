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

const ZARINPAL_REQUEST_URL = 'https://api.zarinpal.com/pg/v4/payment/request.json';
const ZARINPAL_VERIFY_URL = 'https://api.zarinpal.com/pg/v4/payment/verify.json';
const ZARINPAL_PAYMENT_URL = 'https://www.zarinpal.com/pg/StartPay/';

export async function requestPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
  try {
    const merchantId = process.env.ZARINPAL_MERCHANT_ID || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
    
    const requestBody = {
      MerchantID: merchantId,
      Amount: paymentData.amount,
      CallbackURL: paymentData.callbackUrl,
      Description: paymentData.description,
      Email: paymentData.email,
      Mobile: paymentData.mobile,
    };

    const response = await fetch(ZARINPAL_REQUEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (result.Status === 100) {
      return {
        status: result.Status,
        authority: result.Authority,
        url: ZARINPAL_PAYMENT_URL + result.Authority
      };
    } else {
      throw new Error(`Payment request failed with status: ${result.Status}`);
    }
  } catch (error) {
    console.error('ZarinPal payment request error:', error);
    throw error;
  }
}

export async function verifyPayment(authority: string, amount: number): Promise<VerifyResponse> {
  try {
    const merchantId = process.env.ZARINPAL_MERCHANT_ID || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
    
    const requestBody = {
      MerchantID: merchantId,
      Amount: amount,
      Authority: authority,
    };

    const response = await fetch(ZARINPAL_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    return {
      status: result.Status,
      refId: result.RefID
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
    '-21': 'هیچ نوع عملیات مالی برای این تراکنش تعریف نشده',
    '-22': 'تراکنش ناموفق',
    '-33': 'رقم تراکنش با رقم پرداخت شده مطابقت ندارد',
    '-34': 'سقف تقسیم تراکنش از لحاظ تعداد یا رقم عبور کرده',
    '-40': 'اجازه دسترسی به متد مربوطه وجود ندارد',
    '-41': 'اطلاعات ارسال شده مربوط به Additional Data غیر معتبر می‌باشد',
    '-42': 'مدت زمان معتبر طول عمر شناسه پرداخت بایستی بین 30 دقیقه تا 45 رو�� مشخص گردد',
    '-54': 'درخواست مورد نظر یافت نشد'
  };

  return statusMessages[status] || `خطای ناشناخته (کد: ${status})`;
}
