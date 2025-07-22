import cron from 'node-cron';
import { db } from './db';
import { sendNotification, NotificationData } from './notifications';

export function startNotificationScheduler() {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Starting daily notification check...');
    await checkAndSendNotifications();
  }, {
    timezone: "Asia/Tehran"
  });

  // Also run every 6 hours for more frequent checks
  cron.schedule('0 */6 * * *', async () => {
    console.log('Starting 6-hour notification check...');
    await checkAndSendNotifications();
  }, {
    timezone: "Asia/Tehran"
  });

  console.log('Notification scheduler started');
}

async function checkAndSendNotifications() {
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

    console.log(`Found ${dueReminders.length} reminders to check`);

    let sentCount = 0;
    let failedCount = 0;

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

            sentCount++;
            console.log(`✅ Sent ${reminder.method} notification for event: ${reminder.event.title}`);
          } else {
            failedCount++;
            console.error(`❌ Failed to send ${reminder.method} notification for event: ${reminder.event.title}`);
          }
        }
      } catch (error) {
        console.error('Error processing reminder:', reminder.id, error);
        failedCount++;
      }
    }

    console.log(`Notification check completed. Sent: ${sentCount}, Failed: ${failedCount}`);

  } catch (error) {
    console.error('Error in notification scheduler:', error);
  }
}

// Manual trigger for testing
export async function triggerNotificationCheck() {
  console.log('Manual notification check triggered');
  await checkAndSendNotifications();
}
