import { Router, Response } from 'express';
import { db } from '../lib/db';
import { authenticateToken, AuthRequest } from '../lib/auth';
import { requestPayment, verifyPayment, getPaymentStatusMessage } from '../lib/zarinpal';

const router = Router();

// Get current subscription
router.get('/current', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionType: true,
        _count: {
          select: {
            events: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        subscription,
        currentType: user?.subscriptionType || 'FREE',
        eventCount: user?._count.events || 0,
        limits: {
          FREE: {
            maxEvents: 3,
            reminderMethods: ['EMAIL'],
            features: ['بیسیک یادآوری', 'ایمیل']
          },
          PREMIUM: {
            maxEvents: -1, // unlimited
            reminderMethods: ['EMAIL', 'SMS', 'WHATSAPP'],
            features: ['یادآوری نامحدود', 'ایمیل', 'پیامک', 'واتساپ', 'پشتیبانی اولویت‌دار']
          },
          BUSINESS: {
            maxEvents: -1,
            reminderMethods: ['EMAIL', 'SMS', 'WHATSAPP'],
            features: ['تمام امکانات پرمیوم', 'مدیریت تیم', 'گزارش‌گیری', 'API دسترسی']
          }
        }
      }
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت اطلاعات اشتراک'
    });
  }
});

// Get subscription plans
router.get('/plans', async (req, res: Response) => {
  try {
    const plans = {
      FREE: {
        name: 'رایگان',
        price: 0,
        duration: 'دائمی',
        maxEvents: 3,
        reminderMethods: ['EMAIL'],
        features: [
          'تا ۳ رویداد',
          'یادآوری از طریق ایمیل',
          'پشتیبانی پایه'
        ]
      },
      PREMIUM: {
        name: 'پرمیوم',
        price: 49000,
        duration: 'ماهانه',
        maxEvents: -1,
        reminderMethods: ['EMAIL', 'SMS', 'WHATSAPP'],
        features: [
          'رویدادهای نامحدود',
          'یادآوری ایمیل',
          'یادآوری پیامک',
          'یادآوری واتس‌اپ',
          'پشتیبانی اولویت‌دار'
        ]
      },
      BUSINESS: {
        name: 'کسب‌وکار',
        price: 149000,
        duration: 'ماهانه',
        maxEvents: -1,
        reminderMethods: ['EMAIL', 'SMS', 'WHATSAPP'],
        features: [
          'تمام امکانات پرمیوم',
          'مدیریت چند کاربره',
          'تقویم مشترک',
          'گزارش‌گیری پیشرفته',
          'API دسترسی',
          'پشتیبانی اختصاصی'
        ]
      }
    };

    res.json({
      success: true,
      data: { plans }
    });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت پکیج‌ها'
    });
  }
});

// Start premium subscription (prepare for payment)
router.post('/upgrade', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { planType } = req.body;

    if (!['PREMIUM', 'BUSINESS'].includes(planType)) {
      return res.status(400).json({
        success: false,
        message: 'نوع پکیج نامعتبر است'
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: {
          gt: new Date()
        }
      }
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'شما در حال حاضر یک اشتراک فعال دارید'
      });
    }

    // Create pending subscription
    const amount = planType === 'PREMIUM' ? 49000 : 149000;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Add 1 month

    const subscription = await db.subscription.create({
      data: {
        userId,
        type: planType as any,
        endDate,
        amount,
        isActive: false // Will be activated after payment
      }
    });

    // Here you would integrate with ZarinPal
    // For now, we'll simulate the payment process
    const paymentData = {
      subscriptionId: subscription.id,
      amount,
      description: `خرید پکیج ${planType === 'PREMIUM' ? 'پرمیوم' : 'کسب‌وکار'}`,
      // In real implementation, you'd get payment URL from ZarinPal
      paymentUrl: `/payment/zarinpal?subscription=${subscription.id}&amount=${amount}`
    };

    res.json({
      success: true,
      message: 'درخواست ارتقا ایجاد شد',
      data: paymentData
    });

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ارتقا اشتراک'
    });
  }
});

// Confirm payment (simulate ZarinPal callback)
router.post('/confirm-payment', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { subscriptionId, paymentStatus } = req.body;
    const userId = req.user!.userId;

    const subscription = await db.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId,
        isActive: false
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'اشتراک یافت نشد'
      });
    }

    if (paymentStatus === 'success') {
      // Activate subscription
      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          isActive: true,
          paymentId: `payment_${Date.now()}` // Simulate payment ID
        }
      });

      // Update user subscription type
      await db.user.update({
        where: { id: userId },
        data: {
          subscriptionType: subscription.type
        }
      });

      res.json({
        success: true,
        message: 'پرداخت با موفقیت انجام شد و اشتراک فعال گردید'
      });
    } else {
      // Delete failed subscription
      await db.subscription.delete({
        where: { id: subscriptionId }
      });

      res.status(400).json({
        success: false,
        message: 'پرداخت ناموفق بود'
      });
    }

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در تایید پرداخت'
    });
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Find active subscription
    const subscription = await db.subscription.findFirst({
      where: {
        userId,
        isActive: true
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'اشتراک فعالی یافت نشد'
      });
    }

    // Deactivate subscription
    await db.subscription.update({
      where: { id: subscription.id },
      data: { isActive: false }
    });

    // Revert user to free plan
    await db.user.update({
      where: { id: userId },
      data: { subscriptionType: 'FREE' }
    });

    res.json({
      success: true,
      message: 'اشتراک با موفقیت لغو شد'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در لغو اشتراک'
    });
  }
});

export default router;
