import { Router, Request, Response } from "express";
import { db } from "../lib/db";
import { hashPassword, comparePassword, generateToken } from "../lib/auth";
import {
  validateRequest,
  registerSchema,
  loginSchema,
} from "../lib/validation";

const router = Router();

// Register
router.post(
  "/register",
  validateRequest(registerSchema),
  async (req: Request, res: Response) => {
    try {
      const { fullName, email, password, accountType, inviteToken } = req.body;

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "کاربری با این ایمیل قبلاً ثبت نام کرده است",
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Check for team invitation (prioritize token-based lookup)
      let teamInvitation = null;

      if (inviteToken) {
        // If invite token provided, look up by token
        teamInvitation = await db.teamInvitation.findFirst({
          where: {
            inviteToken: inviteToken,
            email: email,
            isAccepted: false,
            expiresAt: {
              gt: new Date()
            }
          },
          include: {
            team: true
          }
        });
      } else {
        // Fallback to email-based lookup for backward compatibility
        teamInvitation = await db.teamInvitation.findFirst({
          where: {
            email: email,
            isAccepted: false,
            expiresAt: {
              gt: new Date()
            }
          },
          include: {
            team: true
          }
        });
      }

      // Create user
      const user = await db.user.create({
        data: {
          fullName,
          email,
          password: hashedPassword,
          accountType: accountType || "PERSONAL",
          subscriptionType: "FREE",
          teamId: teamInvitation?.teamId || null, // Auto-join team if invited
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          accountType: true,
          subscriptionType: true,
          createdAt: true,
        },
      });

      // If user was invited to team, accept invitation and create membership
      if (teamInvitation) {
        await db.$transaction([
          // Mark invitation as accepted
          db.teamInvitation.update({
            where: { id: teamInvitation.id },
            data: { isAccepted: true }
          }),
          // Create team membership
          db.teamMembership.create({
            data: {
              teamId: teamInvitation.teamId,
              userId: user.id,
              role: teamInvitation.role,
              joinedAt: new Date()
            }
          })
        ]);
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        accountType: user.accountType,
        subscriptionType: user.subscriptionType,
      });

      res.status(201).json({
        success: true,
        message: "ثبت نام با موفقیت انجام شد",
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "خطا در ثبت نام",
      });
    }
  },
);

// Login
router.post(
  "/login",
  validateRequest(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await db.user.findUnique({
        where: { email },
        include: {
          subscriptions: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "ایمیل یا رمز عبور اشتباه است",
        });
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "ایمیل یا رمز عبور اشتباه است",
        });
      }

      // Update subscription type based on active subscription
      let currentSubscriptionType = user.subscriptionType;
      if (user.subscriptions.length > 0) {
        const activeSubscription = user.subscriptions[0];
        if (
          activeSubscription.endDate &&
          activeSubscription.endDate > new Date()
        ) {
          currentSubscriptionType = activeSubscription.type;
        }
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        accountType: user.accountType,
        subscriptionType: currentSubscriptionType,
      });

      // Return user data without password
      const { password: _, ...userData } = user;

      res.json({
        success: true,
        message: "ورود موفقیت‌آمیز",
        data: {
          user: {
            ...userData,
            subscriptionType: currentSubscriptionType,
          },
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "خطا در ورود",
      });
    }
  },
);

// Get current user profile
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "توکن دسترسی ارائه نشده است",
      });
    }

    const { verifyToken } = await import("../lib/auth");
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
        teamId: true,
        createdAt: true,
        team: {
          select: {
            id: true,
            name: true,
            description: true,
            ownerId: true,
          }
        },
        teamMemberships: {
          where: { isActive: true },
          select: {
            role: true,
            joinedAt: true,
            teamId: true,
          }
        },
        _count: {
          select: {
            events: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "کاربر یافت نشد",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت اطلاعات کاربر",
    });
  }
});

// Update user profile
router.put("/profile", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "توکن دسترسی ارائه نشده است",
      });
    }

    const { verifyToken } = await import("../lib/auth");
    const decoded = verifyToken(token);

    const { fullName, phone } = req.body;

    // Validate input
    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "نام باید حداقل ۲ کاراکتر باشد",
      });
    }

    const updateData: any = {
      fullName: fullName.trim(),
    };

    if (phone) {
      // Validate phone number (simple validation)
      const phoneRegex = /^09\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "شماره تلفن باید با 09 ��روع شده و ۱۱ رقم باشد",
        });
      }
      updateData.phone = phone;
    }

    const user = await db.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        accountType: true,
        subscriptionType: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      message: "پروفایل با موفقیت به‌روزرسانی شد",
      data: { user },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در به‌روزرسانی پروفایل",
    });
  }
});

export default router;
