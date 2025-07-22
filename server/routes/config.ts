import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../lib/auth';
import { sendEmailNotification, sendSMSNotification, sendWhatsAppNotification } from '../lib/notifications';
import { requestPayment } from '../lib/zarinpal-simple';
import fs from 'fs';
import path from 'path';

const router = Router();

// Admin authentication middleware - only for farnadadmin@gmail.com
const requireAdmin = (req: AuthRequest, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'احراز هویت لازم است'
    });
  }

  if (req.user.email !== 'farnadadmin@gmail.com') {
    return res.status(403).json({
      success: false,
      message: 'دسترسی ادمین لازم است'
    });
  }

  next();
};

// Helper function to read and parse .env file
const readEnvFile = (): Record<string, string> => {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error reading .env file:', error);
    return {};
  }
};

// Helper function to write .env file
const writeEnvFile = (envVars: Record<string, string>): void => {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync(envPath, envContent, 'utf8');
  } catch (error) {
    console.error('Error writing .env file:', error);
    throw new Error('خطا در ذخیره فایل تنظیمات');
  }
};

// Get current system configuration
router.get('/system', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const envVars = readEnvFile();
    
    const config = {
      email: {
        user: envVars.EMAIL_USER || '',
        password: envVars.EMAIL_PASS ? '••••••••' : '',
        service: envVars.EMAIL_SERVICE || 'gmail',
        enabled: !!(envVars.EMAIL_USER && envVars.EMAIL_PASS && 
                   envVars.EMAIL_USER !== 'your-email@gmail.com')
      },
      sms: {
        username: envVars.SMS_USERNAME || '',
        password: envVars.SMS_PASSWORD ? '••••••••' : '',
        sender: envVars.SMS_SENDER || '',
        enabled: !!(envVars.SMS_USERNAME && envVars.SMS_PASSWORD && 
                   envVars.SMS_USERNAME !== 'your-username')
      },
      whatsapp: {
        apiKey: envVars.WHATSAPP_API_KEY ? '••••••••' : '',
        enabled: !!(envVars.WHATSAPP_API_KEY && 
                   envVars.WHATSAPP_API_KEY !== 'your-whatsapp-api-key')
      },
      zarinpal: {
        merchantId: envVars.ZARINPAL_MERCHANT_ID ? '••••••••-••••-••••-••••-••••••••••••' : '',
        sandbox: envVars.ZARINPAL_SANDBOX === 'true',
        enabled: !!(envVars.ZARINPAL_MERCHANT_ID && 
                   envVars.ZARINPAL_MERCHANT_ID !== 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')
      },
      app: {
        url: envVars.APP_URL || '',
        name: envVars.APP_NAME || 'رویداد یار',
        supportEmail: envVars.SUPPORT_EMAIL || ''
      }
    };

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Get system config error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت تنظیمات سیستم'
    });
  }
});

// Update system configuration
router.put('/system', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { config, section } = req.body;
    const envVars = readEnvFile();

    // Update specific section or all sections
    if (!section || section === 'email') {
      if (config.email) {
        envVars.EMAIL_USER = config.email.user || '';
        if (config.email.password && config.email.password !== '••••••••') {
          envVars.EMAIL_PASS = config.email.password;
        }
        envVars.EMAIL_SERVICE = config.email.service || 'gmail';
      }
    }

    if (!section || section === 'sms') {
      if (config.sms) {
        envVars.SMS_USERNAME = config.sms.username || '';
        if (config.sms.password && config.sms.password !== '••••••••') {
          envVars.SMS_PASSWORD = config.sms.password;
        }
        envVars.SMS_SENDER = config.sms.sender || '';
      }
    }

    if (!section || section === 'whatsapp') {
      if (config.whatsapp) {
        if (config.whatsapp.apiKey && config.whatsapp.apiKey !== '••••••••') {
          envVars.WHATSAPP_API_KEY = config.whatsapp.apiKey;
        }
      }
    }

    if (!section || section === 'zarinpal') {
      if (config.zarinpal) {
        if (config.zarinpal.merchantId && !config.zarinpal.merchantId.includes('••••')) {
          envVars.ZARINPAL_MERCHANT_ID = config.zarinpal.merchantId;
        }
        envVars.ZARINPAL_SANDBOX = config.zarinpal.sandbox ? 'true' : 'false';
      }
    }

    if (!section || section === 'app') {
      if (config.app) {
        envVars.APP_URL = config.app.url || '';
        envVars.APP_NAME = config.app.name || 'رویداد یار';
        envVars.SUPPORT_EMAIL = config.app.supportEmail || '';
      }
    }

    // Write updated configuration
    writeEnvFile(envVars);

    // Update process.env for current session
    Object.keys(envVars).forEach(key => {
      process.env[key] = envVars[key];
    });

    res.json({
      success: true,
      message: 'تنظیمات با موفقیت ذخیره شد'
    });

  } catch (error) {
    console.error('Update system config error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'خطا در ذخیره تنظیمات'
    });
  }
});

// Test system services
router.post('/test/:service', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { service } = req.params;
    const user = req.user!;

    switch (service) {
      case 'email':
        try {
          const result = await sendEmailNotification({
            to: user.email,
            eventTitle: 'تست سیستم ایمیل',
            eventDate: new Date().toISOString(),
            daysUntil: 0,
            userFullName: user.fullName || 'ادمین سیستم'
          });

          if (result) {
            res.json({
              success: true,
              message: 'ایمیل تست با موفقیت ارسال شد'
            });
          } else {
            res.status(400).json({
              success: false,
              message: 'خطا در ارسال ایمیل - تنظیمات را بررسی کنید'
            });
          }
        } catch (error) {
          res.status(400).json({
            success: false,
            message: 'خطا در ارسال ایمیل: ' + (error as Error).message
          });
        }
        break;

      case 'sms':
        try {
          if (!user.phone) {
            return res.status(400).json({
              success: false,
              message: 'شماره تلفن در پروفایل ادمین موجود نیست'
            });
          }

          const result = await sendSMSNotification({
            to: user.email,
            eventTitle: 'تست سیستم پیامک',
            eventDate: new Date().toISOString(),
            daysUntil: 0,
            userFullName: user.fullName || 'ادمین سیستم'
          }, user.phone);

          if (result) {
            res.json({
              success: true,
              message: 'پیامک تست با موفقیت ارسال شد'
            });
          } else {
            res.status(400).json({
              success: false,
              message: 'خطا در ارسال پیامک - تنظیمات را بررسی کنید'
            });
          }
        } catch (error) {
          res.status(400).json({
            success: false,
            message: 'خطا در ارسال پیامک: ' + (error as Error).message
          });
        }
        break;

      case 'whatsapp':
        try {
          if (!user.phone) {
            return res.status(400).json({
              success: false,
              message: 'شماره تلفن در پروفایل ادمین موجود نیست'
            });
          }

          const result = await sendWhatsAppNotification({
            to: user.email,
            eventTitle: 'تست سیستم واتس‌اپ',
            eventDate: new Date().toISOString(),
            daysUntil: 0,
            userFullName: user.fullName || 'ادمین سیستم'
          }, user.phone);

          res.json({
            success: true,
            message: result 
              ? 'واتس‌اپ تست با موفقیت ارسال شد' 
              : 'تست واتس‌اپ در حالت demo اجرا شد'
          });
        } catch (error) {
          res.status(400).json({
            success: false,
            message: 'خطا در تست واتس‌اپ: ' + (error as Error).message
          });
        }
        break;

      case 'zarinpal':
        try {
          const testPayment = await requestPayment({
            amount: 1000, // Test amount: 10 Toman
            description: 'تست اتصال درگاه پرداخ��',
            callbackUrl: `${process.env.APP_URL || 'http://localhost:8080'}/api/config/test-callback`,
            email: user.email
          });

          res.json({
            success: true,
            message: 'اتصال به زرین‌پال موفق - درگاه پرداخت در دسترس است',
            data: {
              authority: testPayment.authority?.substring(0, 10) + '...'
            }
          });
        } catch (error) {
          res.status(400).json({
            success: false,
            message: 'خطا در اتصال به زرین‌پال: ' + (error as Error).message
          });
        }
        break;

      default:
        res.status(400).json({
          success: false,
          message: 'سرویس نامعتبر'
        });
    }

  } catch (error) {
    console.error(`Test ${req.params.service} error:`, error);
    res.status(500).json({
      success: false,
      message: 'خطا در تست سرویس'
    });
  }
});

// Test callback for ZarinPal (just for testing connection)
router.get('/test-callback', async (req, res: Response) => {
  res.send(`
    <html dir="rtl">
      <head><title>تست زرین‌پال</title></head>
      <body style="font-family: Tahoma; text-align: center; padding: 50px;">
        <h2>��� تست اتصال زرین‌پال موفق بود</h2>
        <p>این صفحه فقط برای تست اتصال درگاه پرداخت است</p>
        <button onclick="window.close()">بستن</button>
      </body>
    </html>
  `);
});

export default router;
