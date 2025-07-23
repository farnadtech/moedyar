import { z } from "zod";

// User Registration Schema
export const registerSchema = z.object({
  fullName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  email: z.string().email("فرمت ایمیل صحیح نیست"),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
  accountType: z.enum(["PERSONAL", "BUSINESS"]).optional().default("PERSONAL"),
  inviteToken: z.string().optional(),
});

// User Login Schema
export const loginSchema = z.object({
  email: z.string().email("فرمت ایمیل صحیح نیست"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

// Event Creation Schema
export const eventSchema = z.object({
  title: z.string().min(1, "عنوان رویداد الزامی است"),
  description: z.string().optional(),
  eventDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "تاریخ نامعتبر است",
  }),
  eventType: z
    .enum(["BIRTHDAY", "INSURANCE", "CONTRACT", "CHECK", "CUSTOM"])
    .default("CUSTOM"),
  reminderDays: z.array(z.number().positive()).optional().default([1, 7]),
  reminderMethods: z
    .array(z.enum(["EMAIL", "SMS", "WHATSAPP"]))
    .optional()
    .default(["EMAIL"]),
});

// Event Update Schema
export const eventUpdateSchema = eventSchema.partial();

// Reminder Schema
export const reminderSchema = z.object({
  daysBefore: z.number().positive("روزهای یادآوری باید مثبت باشد"),
  method: z.enum(["EMAIL", "SMS", "WHATSAPP"]),
});

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "داده‌های ورودی نامعتبر",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
