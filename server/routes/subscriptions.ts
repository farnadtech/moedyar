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

// Start premium subscription with ZarinPal
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

    // Get user info for ZarinPal
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    // Create ZarinPal payment request
    try {
      const callbackUrl = `${process.env.APP_URL || 'http://localhost:8080'}/api/subscriptions/verify-payment?subscription=${subscription.id}`;
      
      const paymentResponse = await requestPayment({
        amount,
        description: `خرید پکیج ${planType === 'PREMIUM' ? 'پرمیوم' : 'کسب‌وکار'} - رویداد یار`,
        callbackUrl,
        email: user.email,
        mobile: user.phone || undefined
      });

      // Store payment authority in subscription
      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          paymentId: paymentResponse.authority
        }
      });

      res.json({
        success: true,
        message: 'درخواست پرداخت ایجاد شد',
        data: {
          subscriptionId: subscription.id,
          amount,
          authority: paymentResponse.authority,
          paymentUrl: paymentResponse.url
        }
      });

    } catch (paymentError) {
      console.error('ZarinPal payment error:', paymentError);
      
      // Delete the subscription if payment request failed
      await db.subscription.delete({
        where: { id: subscription.id }
      });

      res.status(500).json({
        success: false,
        message: 'خطا در ایجاد درخواست پرداخت'
      });
    }

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ارتقا اشتراک'
    });
  }
});

// Verify ZarinPal payment (callback handler)
router.get('/verify-payment', async (req, res: Response) => {
  try {
    const { Authority, Status, subscription: subscriptionId } = req.query;

    if (!Authority || !subscriptionId) {
      return res.redirect(`${process.env.APP_URL || 'http://localhost:8080'}/dashboard?payment=failed&reason=invalid_params`);
    }

    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId as string },
      include: { user: true }
    });

    if (!subscription) {
      return res.redirect(`${process.env.APP_URL || 'http://localhost:8080'}/dashboard?payment=failed&reason=subscription_not_found`);
    }

    if (Status !== 'OK') {
      // Payment was cancelled or failed
      await db.subscription.delete({
        where: { id: subscription.id }
      });
      
      return res.redirect(`${process.env.APP_URL || 'http://localhost:8080'}/dashboard?payment=cancelled`);
    }

    try {
      // Verify payment with ZarinPal
      const verifyResponse = await verifyPayment(Authority as string, subscription.amount || 0);

      if (verifyResponse.status === 100 || verifyResponse.status === 101) {
        // Payment successful
        await db.subscription.update({
          where: { id: subscription.id },
          data: {
            isActive: true,
            paymentId: verifyResponse.refId || Authority as string
          }
        });

        // Update user subscription type
        await db.user.update({
          where: { id: subscription.userId },
          data: {
            subscriptionType: subscription.type
          }
        });

        return res.redirect(`${process.env.APP_URL || 'http://localhost:8080'}/dashboard?payment=success&plan=${subscription.type.toLowerCase()}`);
      } else {
        // Payment verification failed
        await db.subscription.delete({
          where: { id: subscription.id }
        });

        const errorMessage = getPaymentStatusMessage(verifyResponse.status);
        return res.redirect(`${process.env.APP_URL || 'http://localhost:8080'}/dashboard?payment=failed&reason=${encodeURIComponent(errorMessage)}`);
      }

    } catch (verifyError) {
      console.error('Payment verification error:', verifyError);
      
      await db.subscription.delete({
        where: { id: subscription.id }
      });

      return res.redirect(`${process.env.APP_URL || 'http://localhost:8080'}/dashboard?payment=failed&reason=verification_error`);
    }

  } catch (error) {
    console.error('Payment verification handler error:', error);
    return res.redirect(`${process.env.APP_URL || 'http://localhost:8080'}/dashboard?payment=failed&reason=server_error`);
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
        message: 'اشتر��ک فعالی یافت نشد'
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
