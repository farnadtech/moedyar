import { Router, Request, Response } from 'express';
import { db } from '../lib/db';
import { hashPassword, comparePassword, generateToken } from '../lib/auth';
import { validateRequest, registerSchema, loginSchema } from '../lib/validation';

const router = Router();

// Register
router.post('/register', validateRequest(registerSchema), async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, accountType } = req.body;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'کاربری با این ایمیل قبلاً ثبت نام کرده است'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await db.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        accountType: accountType || 'PERSONAL',
        subscriptionType: 'FREE'
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        accountType: true,
        subscriptionType: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      accountType: user.accountType,
      subscriptionType: user.subscriptionType
    });

    res.status(201).json({
      success: true,
      message: 'ثبت نام با موفقیت انجام شد',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت نام'
    });
  }
});

// Login
router.post('/login', validateRequest(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db.user.findUnique({
      where: { email },
      include: {
        subscriptions: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'ایمیل یا رمز عبور اشتباه است'
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'ایمیل یا رمز عبور اشتباه است'
      });
    }

    // Update subscription type based on active subscription
    let currentSubscriptionType = user.subscriptionType;
    if (user.subscriptions.length > 0) {
      const activeSubscription = user.subscriptions[0];
      if (activeSubscription.endDate && activeSubscription.endDate > new Date()) {
        currentSubscriptionType = activeSubscription.type;
      }
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      accountType: user.accountType,
      subscriptionType: currentSubscriptionType
    });

    // Return user data without password
    const { password: _, ...userData } = user;

    res.json({
      success: true,
      message: 'ورود موفق��ت‌آمیز',
      data: {
        user: {
          ...userData,
          subscriptionType: currentSubscriptionType
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ورود'
    });
  }
});

// Get current user profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'توکن دسترسی ارائه نشده است'
      });
    }

    const { verifyToken } = await import('../lib/auth');
    const decoded = verifyToken(token);

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        accountType: true,
        subscriptionType: true,
        phone: true,
        isEmailVerified: true,
        createdAt: true,
        _count: {
          select: {
            events: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت اطلاعات کاربر'
    });
  }
});

export default router;
