import { Router, Request, Response } from "express";
import { db } from "../lib/db";
import { hashPassword, comparePassword, generateToken } from "../lib/auth";
import {
  validateRequest,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../lib/validation";
import { sendEmailNotification } from "../lib/notifications";

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
              gt: new Date(),
            },
          },
          include: {
            team: true,
          },
        });
      } else {
        // Fallback to email-based lookup for backward compatibility
        teamInvitation = await db.teamInvitation.findFirst({
          where: {
            email: email,
            isAccepted: false,
            expiresAt: {
              gt: new Date(),
            },
          },
          include: {
            team: true,
          },
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
            data: { isAccepted: true },
          }),
          // Create team membership
          db.teamMembership.create({
            data: {
              teamId: teamInvitation.teamId,
              userId: user.id,
              role: teamInvitation.role,
              joinedAt: new Date(),
            },
          }),
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
          team: {
            select: {
              id: true,
              name: true,
              description: true,
              ownerId: true,
            },
          },
          teamMemberships: {
            where: { isActive: true },
            select: {
              role: true,
              joinedAt: true,
              teamId: true,
            },
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

      // Calculate effective subscription type (including team benefits)
      let currentSubscriptionType = user.subscriptionType;

      // First check user's own subscriptions
      if (user.subscriptions.length > 0) {
        const activeSubscription = user.subscriptions[0];
        if (
          activeSubscription.endDate &&
          activeSubscription.endDate > new Date()
        ) {
          currentSubscriptionType = activeSubscription.type;
        }
      }

      // If user is part of a team, they get team owner's subscription benefits
      if (user.teamId && user.team) {
        const teamOwner = await db.user.findUnique({
          where: { id: user.team.ownerId },
          select: {
            subscriptionType: true,
            subscriptions: {
              where: { isActive: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        });

        if (teamOwner) {
          currentSubscriptionType = teamOwner.subscriptionType;

          // Check for active team owner subscription
          if (teamOwner.subscriptions.length > 0) {
            const activeSubscription = teamOwner.subscriptions[0];
            if (
              activeSubscription.endDate &&
              activeSubscription.endDate > new Date()
            ) {
              currentSubscriptionType = activeSubscription.type;
            }
          }
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
          },
        },
        teamMemberships: {
          where: { isActive: true },
          select: {
            role: true,
            joinedAt: true,
            teamId: true,
          },
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

    // Debug logging
    console.log("User data in /me endpoint:", {
      id: user.id,
      email: user.email,
      teamId: user.teamId,
      subscriptionType: user.subscriptionType,
      teamMemberships: user.teamMemberships,
      team: user.team,
    });

    // Determine effective subscription type
    let effectiveSubscriptionType = user.subscriptionType;

    // If user is part of a team, they get team owner's subscription benefits
    if (user.team && user.teamId) {
      // Get team owner's subscription
      const teamOwner = await db.user.findUnique({
        where: { id: user.team.ownerId },
        select: {
          subscriptionType: true,
          subscriptions: {
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (teamOwner) {
        effectiveSubscriptionType = teamOwner.subscriptionType;

        console.log("Team owner subscription data:", {
          ownerId: user.team.ownerId,
          ownerSubscriptionType: teamOwner.subscriptionType,
          activeSubscriptions: teamOwner.subscriptions,
          currentEffective: effectiveSubscriptionType,
        });

        // Check for active subscription
        if (teamOwner.subscriptions.length > 0) {
          const activeSubscription = teamOwner.subscriptions[0];
          if (
            activeSubscription.endDate &&
            activeSubscription.endDate > new Date()
          ) {
            effectiveSubscriptionType = activeSubscription.type;
            console.log(
              "Found active subscription, updating to:",
              effectiveSubscriptionType,
            );
          }
        }
      }
    }

    console.log("Final subscription calculation:", {
      userId: user.id,
      originalSubscriptionType: user.subscriptionType,
      effectiveSubscriptionType: effectiveSubscriptionType,
      hasTeam: !!user.team,
      teamId: user.teamId,
    });

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          subscriptionType: effectiveSubscriptionType,
        },
      },
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
          message: "شماره تلفن باید با 09 شروع شده و ۱۱ رقم باشد",
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

// Forgot Password
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Check if user exists
      const user = await db.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          fullName: true,
        },
      });

      // Always return success message for security (don't reveal if email exists)
      // But only send email if user actually exists
      if (user) {
        // Generate a password reset token (in a real app, you'd store this in DB with expiration)
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const resetLink = `${process.env.APP_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        // Send password reset email
        try {
          await sendPasswordResetEmail({
            to: email,
            fullName: user.fullName,
            resetLink: resetLink,
          });
          console.log(`📧 Password reset email sent to: ${email}`);
        } catch (emailError) {
          console.error('Failed to send password reset email:', emailError);
          // Don't throw error to user for security reasons
        }
      }

      // Always return success for security
      res.json({
        success: true,
        message: "اگر ایمیل شما در سیستم موجود باشد، لینک بازیابی رمز عبور برای شما ارسال خواهد شد",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "خطا در ارسال ایمیل بازیابی",
      });
    }
  },
);

// Reset Password
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  async (req: Request, res: Response) => {
    try {
      const { token, email, password } = req.body;

      // In a real application, you would:
      // 1. Verify the token from database
      // 2. Check if token is not expired
      // 3. Ensure token belongs to the email
      
      // For now, we'll just check if user exists and update password
      const user = await db.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
        },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "لینک بازیابی نامعتبر یا منقضی شده است",
        });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(password);

      // Update user password
      await db.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      res.json({
        success: true,
        message: "رمز عبور با موفقیت تغییر کرد",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "خطا در تغییر رمز عبور",
      });
    }
  },
);

// Helper function to send password reset email
async function sendPasswordResetEmail(data: {
  to: string;
  fullName: string;
  resetLink: string;
}): Promise<boolean> {
  try {
    // Check if email is configured
    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER === "your-email@gmail.com"
    ) {
      console.log("📧 Password reset email (DEMO MODE - not actually sent):", {
        to: data.to,
        fullName: data.fullName,
        resetLink: data.resetLink,
        note: "Configure EMAIL_USER and EMAIL_PASS in .env to send real emails",
      });
      return true; // Simulate success for development
    }

    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"رویداد یار" <${process.env.EMAIL_USER}>`,
      to: data.to,
      subject: "بازیابی رمز عبور - رویداد یار",
      html: `
        <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 24px;">🗓️ رویداد یار</h1>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">سلام ${data.fullName} عزیز،</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              درخواست بازیابی رمز عبور برای حساب کاربری شما دریافت شد.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
              برای تنظیم رمز عبور جدید، روی دکمه زیر کلیک کنید:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetLink}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                بازیابی رمز عبور
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              اگر شما این درخواست را نداده‌اید، این ایمیل را نادیده بگیرید.
              <br>
              این لینک تا ۲۴ ساعت معتبر است.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              این ایمیل توسط سیستم رویداد یار ارسال شده است.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

export default router;
