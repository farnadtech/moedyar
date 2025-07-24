import { Router, Response } from 'express';
import { db } from '../lib/db';
import { authenticateToken, AuthRequest, requirePremium } from '../lib/auth';
import { validateRequest, eventSchema, eventUpdateSchema } from '../lib/validation';

const router = Router();

// Get all events for user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const events = await db.event.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        reminders: {
          where: { isActive: true }
        }
      },
      orderBy: {
        eventDate: 'asc'
      }
    });

    res.json({
      success: true,
      data: { events }
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت رویدادها'
    });
  }
});

// Get single event
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const event = await db.event.findFirst({
      where: {
        id,
        userId,
        isActive: true
      },
      include: {
        reminders: {
          where: { isActive: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'رویداد یافت نشد'
      });
    }

    res.json({
      success: true,
      data: { event }
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت رویداد'
    });
  }
});

// Create new event
router.post('/', authenticateToken, validateRequest(eventSchema), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, description, eventDate, eventType, reminderDays = [1, 7], reminderMethods = ['EMAIL'] } = req.body;

    // Check if user is on free plan and has reached limit
    if (req.user!.subscriptionType === 'FREE') {
      const eventCount = await db.event.count({
        where: {
          userId,
          isActive: true
        }
      });

      if (eventCount >= 3) {
        return res.status(403).json({
          success: false,
          message: 'در پکیج رایگان حداکثر ۳ رویداد قابل ثبت است',
          upgradeRequired: true
        });
      }
    }

    // Create event
    const event = await db.event.create({
      data: {
        title,
        description,
        eventDate: new Date(eventDate),
        eventType,
        userId
      }
    });

    // Create reminders
    const reminders = [];
    for (const days of reminderDays) {
      for (const method of reminderMethods) {
        // Check if method is allowed for user's subscription
        if (method !== 'EMAIL' && req.user!.subscriptionType === 'FREE') {
          continue; // Skip non-email methods for free users
        }

        const reminder = await db.reminder.create({
          data: {
            eventId: event.id,
            daysBefore: days,
            method: method as any
          }
        });
        reminders.push(reminder);
      }
    }

    // Return event with reminders
    const eventWithReminders = await db.event.findUnique({
      where: { id: event.id },
      include: {
        reminders: {
          where: { isActive: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'رویداد با موفقیت ایجاد شد',
      data: { event: eventWithReminders }
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ایجاد رویداد'
    });
  }
});

// Update event
router.put('/:id', authenticateToken, validateRequest(eventUpdateSchema), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { title, description, eventDate, eventType, reminderDays, reminderMethods } = req.body;

    // Check if event exists and belongs to user
    const existingEvent = await db.event.findFirst({
      where: {
        id,
        userId,
        isActive: true
      }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'رویداد یافت نشد'
      });
    }

    // Update event
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (eventDate !== undefined) updateData.eventDate = new Date(eventDate);
    if (eventType !== undefined) updateData.eventType = eventType;

    const event = await db.event.update({
      where: { id },
      data: updateData
    });

    // Update reminders if provided
    if (reminderDays && reminderMethods) {
      // Delete existing reminders
      await db.reminder.updateMany({
        where: { eventId: id },
        data: { isActive: false }
      });

      // Create new reminders
      for (const days of reminderDays) {
        for (const method of reminderMethods) {
          if (method !== 'EMAIL' && req.user!.subscriptionType === 'FREE') {
            continue;
          }

          await db.reminder.create({
            data: {
              eventId: id,
              daysBefore: days,
              method: method as any
            }
          });
        }
      }
    }

    // Return updated event with reminders
    const eventWithReminders = await db.event.findUnique({
      where: { id },
      include: {
        reminders: {
          where: { isActive: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'رویداد با موفقیت به‌روزرسانی شد',
      data: { event: eventWithReminders }
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی رویداد'
    });
  }
});

// Delete event
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if event exists and belongs to user
    const existingEvent = await db.event.findFirst({
      where: {
        id,
        userId,
        isActive: true
      }
    });

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'رویداد یافت نشد'
      });
    }

    // Soft delete event (mark as inactive)
    await db.event.update({
      where: { id },
      data: { isActive: false }
    });

    // Deactivate reminders
    await db.reminder.updateMany({
      where: { eventId: id },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'رویداد با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف رویداد'
    });
  }
});

// Get user statistics
router.get('/stats/overview', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [totalEvents, todayEvents, thisWeekEvents, overdueEvents] = await Promise.all([
      db.event.count({
        where: { userId, isActive: true }
      }),
      db.event.count({
        where: {
          userId,
          isActive: true,
          eventDate: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
          }
        }
      }),
      db.event.count({
        where: {
          userId,
          isActive: true,
          eventDate: {
            gte: today,
            lte: nextWeek
          }
        }
      }),
      db.event.count({
        where: {
          userId,
          isActive: true,
          eventDate: {
            lt: today
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalEvents,
          todayEvents,
          thisWeekEvents,
          overdueEvents
        }
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت آمار'
    });
  }
});

export default router;
