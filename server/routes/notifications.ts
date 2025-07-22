import { Router, Response } from 'express';
import { db } from '../lib/db';
import { sendNotification, NotificationData } from '../lib/notifications';
import { authenticateToken, AuthRequest } from '../lib/auth';
import { triggerNotificationCheck } from '../lib/scheduler';

const router = Router();

// Check and send due notifications (this would be called by a cron job)
router.post('/check-and-send', async (req, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active reminders that should be sent today
    const dueReminders = await db.reminder.findMany({
      where: {
        isActive: true,
        event: {
          isActive: true,
          eventDate: {
            gte: today
          }
        }
      },
      include: {
        event: {
          include: {
            user: true
          }
        }
      }
    });

    const sentNotifications = [];
    const failedNotifications = [];

    for (const reminder of dueReminders) {
      try {
        const eventDate = new Date(reminder.event.eventDate);
        const daysDiff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Check if we should send reminder today
        if (daysDiff === reminder.daysBefore || daysDiff === 0) {
          // Check if already sent today
          const lastSent = reminder.lastSentAt;
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          if (lastSent && lastSent >= todayStart) {
            continue; // Already sent today
          }

          const notificationData: NotificationData = {
            to: reminder.event.user.email,
            eventTitle: reminder.event.title,
            eventDate: reminder.event.eventDate.toISOString(),
            daysUntil: daysDiff,
            userFullName: reminder.event.user.fullName
          };

          const success = await sendNotification(
            reminder.method as any,
            notificationData,
            reminder.event.user.phone || undefined
          );

          if (success) {
            // Update last sent time
            await db.reminder.update({
              where: { id: reminder.id },
              data: { lastSentAt: new Date() }
            });

            sentNotifications.push({
              reminderId: reminder.id,
              eventTitle: reminder.event.title,
              method: reminder.method,
              userEmail: reminder.event.user.email
            });
          } else {
            failedNotifications.push({
              reminderId: reminder.id,
              eventTitle: reminder.event.title,
              method: reminder.method,
              error: 'Failed to send notification'
            });
          }
        }
      } catch (error) {
        console.error('Error processing reminder:', reminder.id, error);
        failedNotifications.push({
          reminderId: reminder.id,
          eventTitle: reminder.event.title,
          method: reminder.method,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: true,
      message: 'Notification check completed',
      data: {
        totalChecked: dueReminders.length,
        sent: sentNotifications.length,
        failed: failedNotifications.length,
        sentNotifications,
        failedNotifications
      }
    });

  } catch (error) {
    console.error('Notification check error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در بررسی یادآوری‌ها'
    });
  }
});

// Test notification sending
router.post('/test', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { method = 'EMAIL', eventTitle = 'تست سیستم یادآوری' } = req.body;

    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    const testData: NotificationData = {
      to: user.email,
      eventTitle,
      eventDate: new Date().toISOString(),
      daysUntil: 1,
      userFullName: user.fullName
    };

    const success = await sendNotification(
      method,
      testData,
      user.phone || undefined
    );

    if (success) {
      res.json({
        success: true,
        message: `یادآوری تست با موفقیت از طریق ${method} ارسال شد`
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'خطا در ارسال یادآوری تست'
      });
    }

  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ارسال یادآوری تست'
    });
  }
});

// Manual trigger for notification check (admin only)
router.post('/trigger-check', async (req, res: Response) => {
  try {
    await triggerNotificationCheck();

    res.json({
      success: true,
      message: 'بررسی دستی یادآوری‌ها آغاز شد'
    });

  } catch (error) {
    console.error('Manual trigger error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در اجرای بررسی دستی'
    });
  }
});

export default router;
