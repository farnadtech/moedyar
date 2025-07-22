import { Router, Response } from 'express';
import { db } from '../lib/db';
import { authenticateToken, AuthRequest } from '../lib/auth';

const router = Router();

// Admin authentication middleware
const requireAdmin = (req: AuthRequest, res: Response, next: any) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'احراز هویت لازم است'
    });
  }

  // Only allow the specific admin email
  if (req.user.email !== 'farnadadmin@gmail.com') {
    return res.status(403).json({
      success: false,
      message: 'دسترسی ادمین لازم است'
    });
  }

  next();
};

// Get all users with pagination
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          subscriptions: {
            where: { isActive: true },
            take: 1
          },
          _count: {
            select: {
              events: { where: { isActive: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where })
    ]);

    // Remove passwords from response
    const safeUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      success: true,
      data: {
        users: safeUsers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت لیست کاربران'
    });
  }
});

// Get user details
router.get('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await db.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' }
        },
        events: {
          where: { isActive: true },
          include: {
            reminders: true
          },
          orderBy: { eventDate: 'asc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword }
    });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت جزئیات کاربر'
    });
  }
});

// Update user subscription
router.put('/users/:id/subscription', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { subscriptionType } = req.body;

    if (!['FREE', 'PREMIUM', 'BUSINESS'].includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        message: 'نوع اشتراک نامعتبر است'
      });
    }

    // Update user subscription type
    const user = await db.user.update({
      where: { id },
      data: { subscriptionType }
    });

    // If upgrading to premium, create a subscription record
    if (subscriptionType !== 'FREE') {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await db.subscription.create({
        data: {
          userId: id,
          type: subscriptionType as any,
          endDate,
          amount: subscriptionType === 'PREMIUM' ? 49000 : 149000,
          isActive: true,
          paymentId: `admin_upgrade_${Date.now()}`
        }
      });
    }

    res.json({
      success: true,
      message: 'اشتراک کاربر به‌روزرسانی شد'
    });

  } catch (error) {
    console.error('Update user subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی اشتراک'
    });
  }
});

// Get dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      freeUsers,
      premiumUsers,
      businessUsers,
      totalEvents,
      activeSubscriptions,
      totalRevenue
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { subscriptionType: 'FREE' } }),
      db.user.count({ where: { subscriptionType: 'PREMIUM' } }),
      db.user.count({ where: { subscriptionType: 'BUSINESS' } }),
      db.event.count({ where: { isActive: true } }),
      db.subscription.count({ where: { isActive: true } }),
      db.subscription.aggregate({
        where: { isActive: true },
        _sum: { amount: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          free: freeUsers,
          premium: premiumUsers,
          business: businessUsers
        },
        events: {
          total: totalEvents
        },
        subscriptions: {
          active: activeSubscriptions,
          revenue: totalRevenue._sum.amount || 0
        }
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت آمار'
    });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user!.userId) {
      return res.status(400).json({
        success: false,
        message: 'نمی‌توانید حساب خود را حذف کنید'
      });
    }

    // Delete user (cascading will handle related records)
    await db.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'کاربر با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف کاربر'
    });
  }
});

// Get recent activities
router.get('/activities', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [recentUsers, recentEvents, recentSubscriptions] = await Promise.all([
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          accountType: true,
          createdAt: true
        }
      }),
      db.event.findMany({
        take: 5,
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      }),
      db.subscription.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              fullName: true,
              email: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        recentUsers,
        recentEvents,
        recentSubscriptions
      }
    });

  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت فعالیت‌ها'
    });
  }
});

// Get all events with pagination and user details
router.get('/events', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const eventType = req.query.eventType as string || '';

    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { user: {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } }
          ]
        }}
      ];
    }

    if (eventType) {
      where.eventType = eventType;
    }

    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              subscriptionType: true
            }
          },
          reminders: {
            orderBy: { reminderDate: 'asc' }
          }
        },
        orderBy: { eventDate: 'asc' }
      }),
      db.event.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get admin events error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت لیست رویدادها'
    });
  }
});

// Get all transactions/subscriptions with pagination
router.get('/transactions', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const status = req.query.status as string || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { paymentId: { contains: search, mode: 'insensitive' as const } },
        { user: {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } }
          ]
        }}
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const [transactions, total] = await Promise.all([
      db.subscription.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              subscriptionType: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.subscription.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get admin transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت لیست تراکنش‌ها'
    });
  }
});

export default router;
