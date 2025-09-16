import { Router, Request, Response } from "express";
import { db } from "../lib/db";
import { z } from "zod";
import type { User, LoginRequest, RegisterRequest, ApiResponse } from "@shared/api";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  fullName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  email: z.string().email("فرمت ایمیل صحیح نیست"),
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل صحیح نیست").optional(),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
  role: z.enum(["BUYER", "SELLER"], "نقش کاربری نامعتبر است"),
  businessName: z.string().min(2, "نام کسب‌وکار الزامی است").optional(),
  businessType: z.string().optional(),
  nationalId: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, "پذیرش قوانین الزامی است"),
});

const loginSchema = z.object({
  email: z.string().email("فرمت ایمیل صحیح نیست"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

const verifyPhoneSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, "شماره موبایل صحیح نیست"),
  code: z.string().length(6, "کد تایید باید ۶ رقم باشد"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("فرمت ایمیل صحیح نیست"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "رمز عبور فعلی الزامی است"),
  newPassword: z.string().min(8, "رمز عبور جدید باید حداقل ۸ کاراکتر باشد"),
});

// Mock JWT functions (replace with real implementation)
const generateToken = (userId: string, role: string) => {
  return `mock-jwt-token-${userId}-${role}`;
};

const hashPassword = async (password: string) => {
  return `hashed-${password}`;
};

const comparePassword = async (password: string, hashedPassword: string) => {
  return hashedPassword === `hashed-${password}`;
};

// Register new user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    // In real implementation, check database
    const existingUserCheck = validatedData.email === "existing@example.com";
    
    if (existingUserCheck) {
      return res.status(400).json({
        success: false,
        message: "کاربری با این ایمیل قبلاً ثبت نام کرده است",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user mock data
    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName: validatedData.fullName,
      email: validatedData.email,
      phone: validatedData.phone,
      role: validatedData.role,
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    // Generate token
    const token = generateToken(newUser.id, newUser.role);

    // If seller, create seller profile
    let sellerProfile = null;
    if (validatedData.role === "SELLER" && validatedData.businessName) {
      sellerProfile = {
        id: `seller-${Date.now()}`,
        userId: newUser.id,
        businessName: validatedData.businessName,
        businessType: validatedData.businessType,
        rating: 0,
        totalSales: 0,
        totalRevenue: 0,
        isActive: true,
        verificationStatus: "PENDING" as const,
      };
    }

    const response: ApiResponse<{
      user: User;
      token: string;
      sellerProfile?: any;
    }> = {
      success: true,
      message: "ثبت نام با موفقیت انجام شد",
      data: {
        user: newUser,
        token,
        sellerProfile,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "اطلاعات ورودی نامعتبر است",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطا در ثبت نام",
    });
  }
});

// Login user
router.post("/login", async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Mock user lookup
    const mockUser: User = {
      id: "user-123",
      fullName: "کاربر نمونه",
      email: validatedData.email,
      phone: "09123456789",
      role: "BUYER",
      isVerified: true,
      avatar: "/images/user-avatar.jpg",
      createdAt: new Date().toISOString(),
    };

    // Check password (mock)
    const isPasswordValid = await comparePassword(validatedData.password, "hashed-password123");
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "ایمیل یا رمز عبور اشتباه است",
      });
    }

    // Generate token
    const token = generateToken(mockUser.id, mockUser.role);

    const response: ApiResponse<{
      user: User;
      token: string;
    }> = {
      success: true,
      message: "ورود موفقیت‌آمیز",
      data: {
        user: mockUser,
        token,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Login error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "اطلاعات ورودی نامعتبر است",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطا در ورود",
    });
  }
});

// Get current user profile
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "توکن دسترسی ارائه نشده است",
      });
    }

    // Mock user data
    const mockUser: User = {
      id: "user-123",
      fullName: "کاربر نمونه",
      email: "user@example.com",
      phone: "09123456789",
      role: "BUYER",
      isVerified: true,
      avatar: "/images/user-avatar.jpg",
      createdAt: new Date().toISOString(),
    };

    const response: ApiResponse<{ user: User }> = {
      success: true,
      message: "اطلاعات کاربر با موفقیت دریافت شد",
      data: { user: mockUser },
    };

    res.json(response);
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت اطلاعات کاربر",
    });
  }
});

// Update user profile
router.patch("/profile", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "توکن دسترسی ارائه نشده است",
      });
    }

    const updateData = req.body;

    // Mock profile update
    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: "پروفایل با موفقیت به‌روزرسانی شد",
    };

    res.json(response);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در به‌روزرسانی پروفایل",
    });
  }
});

// Send phone verification code
router.post("/verify-phone/send", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    
    if (!phone || !/^09\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "شماره موبایل صحیح نیست",
      });
    }

    // Mock SMS send
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Verification code for ${phone}: ${verificationCode}`);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: "کد تایید به شماره موبایل شما ارسال شد",
    };

    res.json(response);
  } catch (error) {
    console.error("Send verification code error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در ارسال کد تایید",
    });
  }
});

// Verify phone number
router.post("/verify-phone", async (req: Request, res: Response) => {
  try {
    const validatedData = verifyPhoneSchema.parse(req.body);

    // Mock verification (accept any 6-digit code)
    if (validatedData.code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "کد تایید نامعتبر است",
      });
    }

    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: "شماره موبایل با موفقیت تایید شد",
    };

    res.json(response);
  } catch (error) {
    console.error("Verify phone error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "اطلاعات نامعتبر است",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطا در تایید شماره موبایل",
    });
  }
});

// Reset password request
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);

    // Mock password reset email
    console.log(`Password reset requested for: ${validatedData.email}`);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: "لینک بازیابی رمز عبور به ایمیل شما ارسال شد",
    };

    res.json(response);
  } catch (error) {
    console.error("Forgot password error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "ایمیل نامعتبر است",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطا در درخواست بازیابی رمز عبور",
    });
  }
});

// Change password
router.post("/change-password", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "توکن دسترسی ارائه نشده است",
      });
    }

    const validatedData = changePasswordSchema.parse(req.body);

    // Mock password change
    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: "رمز عبور با موفقیت تغییر کرد",
    };

    res.json(response);
  } catch (error) {
    console.error("Change password error:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "اطلاعات نامعتبر است",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطا در تغییر رمز عبور",
    });
  }
});

// Logout (invalidate token)
router.post("/logout", async (req: Request, res: Response) => {
  try {
    // In real implementation, add token to blacklist or remove from Redis
    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: "خروج موفقیت‌آمیز",
    };

    res.json(response);
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در خروج",
    });
  }
});

// Get seller verification requirements
router.get("/seller-verification", async (req: Request, res: Response) => {
  try {
    const requirements = {
      documents: [
        {
          type: "national_id",
          title: "کارت ملی",
          description: "تصویر واضح از کارت ملی",
          required: true,
          formats: ["jpg", "png", "pdf"],
          maxSize: "5MB",
        },
        {
          type: "business_license",
          title: "جواز کسب",
          description: "جواز کسب یا پروانه فعالیت",
          required: true,
          formats: ["jpg", "png", "pdf"],
          maxSize: "5MB",
        },
        {
          type: "bank_account",
          title: "مدارک بانکی",
          description: "تصویر کارت بانکی یا تایید حساب",
          required: true,
          formats: ["jpg", "png", "pdf"],
          maxSize: "5MB",
        },
        {
          type: "tax_id",
          title: "شناسه مالیاتی",
          description: "شناسه مالیاتی (در صورت داشتن)",
          required: false,
          formats: ["jpg", "png", "pdf"],
          maxSize: "5MB",
        },
      ],
      steps: [
        "تکمیل اطلاعات کسب‌وکار",
        "بارگذاری مدارک مورد نیاز",
        "تایید شماره موبایل",
        "بررسی و تایید توسط تیم موعدیار",
      ],
      verificationTime: "1-3 روز کاری",
    };

    const response: ApiResponse<{ requirements: any }> = {
      success: true,
      message: "شرایط احراز هویت فروشنده دریافت شد",
      data: { requirements },
    };

    res.json(response);
  } catch (error) {
    console.error("Get seller verification requirements error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت شرایط احراز هویت",
    });
  }
});

// Submit seller verification documents
router.post("/seller-verification", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "توکن دسترسی ارائه نشده است",
      });
    }

    const { documents } = req.body;

    // Mock document submission
    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: "مدارک با موفقیت ارسال شد. در انتظار بررسی تیم موعدیار باشید",
    };

    res.json(response);
  } catch (error) {
    console.error("Submit verification documents error:", error);
    res.status(500).json({
      success: false,
      message: "خطا در ارسال مدارک",
    });
  }
});

export default router;