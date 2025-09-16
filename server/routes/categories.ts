import { Router, Request, Response } from "express";
import { db } from "../lib/db";
import { z } from "zod";
import type { Category, ApiResponse } from "@shared/api";

const router = Router();

// Category validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, "نام دسته‌بندی الزامی است"),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.number().int().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

// Authentication middleware (simplified for now)
const requireAdmin = (req: Request, res: Response, next: any) => {
  // TODO: Implement proper JWT authentication and admin check
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "احراز هویت الزامی است",
    });
  }
  // For now, mock admin user
  (req as any).user = { id: "mock-admin-id", role: "ADMIN" };
  next();
};

// Get all categories (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const parentId = req.query.parentId as string;

    // Mock categories data
    const mockCategories: Category[] = [
      {
        id: "cat-1",
        name: "کالای دیجیتال",
        slug: "digital",
        description: "انواع کالاهای دیجیتال و الکترونیکی",
        icon: "📱",
        isActive: true,
        children: [
          {
            id: "cat-1-1",
            name: "موبایل",
            slug: "mobile",
            description: "گوشی‌های هوشمند",
            icon: "📱",
            parentId: "cat-1",
            isActive: true,
          },
          {
            id: "cat-1-2",
            name: "لپ‌تاپ",
            slug: "laptop",
            description: "لپ‌تاپ و نوت‌بوک",
            icon: "💻",
            parentId: "cat-1",
            isActive: true,
          },
          {
            id: "cat-1-3",
            name: "تبلت",
            slug: "tablet",
            description: "تبلت و آیپد",
            icon: "📱",
            parentId: "cat-1",
            isActive: true,
          },
        ],
      },
      {
        id: "cat-2",
        name: "مد و پوشاک",
        slug: "fashion",
        description: "پوشاک و لوازم شخصی",
        icon: "👕",
        isActive: true,
        children: [
          {
            id: "cat-2-1",
            name: "پوشاک مردانه",
            slug: "mens-clothing",
            description: "لباس و لوازم مردانه",
            icon: "👔",
            parentId: "cat-2",
            isActive: true,
          },
          {
            id: "cat-2-2",
            name: "پوشاک زنانه",
            slug: "womens-clothing",
            description: "لباس و لوازم زنانه",
            icon: "👗",
            parentId: "cat-2",
            isActive: true,
          },
          {
            id: "cat-2-3",
            name: "کیف و کفش",
            slug: "bags-shoes",
            description: "کیف، کفش و لوازم جانبی",
            icon: "👜",
            parentId: "cat-2",
            isActive: true,
          },
        ],
      },
      {
        id: "cat-3",
        name: "خانه و آشپزخانه",
        slug: "home-kitchen",
        description: "لوازم خانگی و آشپزخانه",
        icon: "🏠",
        isActive: true,
        children: [
          {
            id: "cat-3-1",
            name: "لوازم خانگی برقی",
            slug: "home-appliances",
            description: "یخچال، ماشین لباسشویی، جاروبرقی",
            icon: "🔌",
            parentId: "cat-3",
            isActive: true,
          },
          {
            id: "cat-3-2",
            name: "آشپزخانه",
            slug: "kitchen",
            description: "ظروف و لوازم آشپزخانه",
            icon: "🍳",
            parentId: "cat-3",
            isActive: true,
          },
        ],
      },
      {
        id: "cat-4",
        name: "کتاب و لوازم تحریر",
        slug: "books-stationery",
        description: "کتاب، مجله و لوازم تحریر",
        icon: "📚",
        isActive: true,
        children: [
          {
            id: "cat-4-1",
            name: "کتاب",
            slug: "books",
            description: "انواع کتاب‌ها",
            icon: "📖",
            parentId: "cat-4",
            isActive: true,
          },
          {
            id: "cat-4-2",
            name: "لوازم تحریر",
            slug: "stationery",
            description: "قلم، دفتر، لوازم مدرسه",
            icon: "✏️",
            parentId: "cat-4",
            isActive: true,
          },
        ],
      },
      {
        id: "cat-5",
        name: "زیبایی و سلامت",
        slug: "beauty-health",
        description: "محصولات زیبایی و بهداشتی",
        icon: "💄",
        isActive: true,
        children: [
          {
            id: "cat-5-1",
            name: "آرایشی و بهداشتی",
            slug: "cosmetics",
            description: "لوازم آرایش و بهداشت",
            icon: "💄",
            parentId: "cat-5",
            isActive: true,
          },
          {
            id: "cat-5-2",
            name: "مکمل و دارو",
            slug: "supplements",
            description: "مکمل غذایی و دارو",
            icon: "💊",
            parentId: "cat-5",
            isActive: true,
          },
        ],
      },
      {
        id: "cat-6",
        name: "ورزش و سفر",
        slug: "sport-travel",
        description: "لوازم ورزشی و سفر",
        icon: "⚽",
        isActive: true,
        children: [
          {
            id: "cat-6-1",
            name: "لوازم ورزشی",
            slug: "sports-equipment",
            description: "وسایل ورزش و تناسب اندام",
            icon: "🏋️",
            parentId: "cat-6",
            isActive: true,
          },
          {
            id: "cat-6-2",
            name: "کوله و چمدان",
            slug: "bags-luggage",
            description: "کوله پشتی، چمدان، ساک سفر",
            icon: "🎒",
            parentId: "cat-6",
            isActive: true,
          },
        ],
      },
    ];

    // Filter categories based on query parameters
    let filteredCategories = mockCategories;

    if (!includeInactive) {
      filteredCategories = mockCategories.filter(cat => cat.isActive);
    }

    if (parentId) {
      // Get children of specific parent category
      const parentCategory = mockCategories.find(cat => cat.id === parentId);
      filteredCategories = parentCategory?.children || [];
    }

    const response: ApiResponse<{ categories: Category[] }> = {
      success: true,
      message: "دسته‌بندی‌ها با موفقیت دریافت شد",
      data: { categories: filteredCategories },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت دسته‌بندی‌ها",
    });
  }
});

// Get single category by ID or slug
router.get("/:identifier", async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    
    // Mock category data
    const mockCategory: Category = {
      id: "cat-1",
      name: "کالای دیجیتال",
      slug: "digital",
      description: "انواع کالاهای دیجیتال و الکترونیکی شامل موبایل، لپ‌تاپ، تبلت و لوازم جانبی",
      icon: "📱",
      image: "/images/categories/digital.jpg",
      isActive: true,
      children: [
        {
          id: "cat-1-1",
          name: "موبایل",
          slug: "mobile",
          description: "گوشی‌های هوشمند",
          icon: "📱",
          parentId: "cat-1",
          isActive: true,
        },
        {
          id: "cat-1-2",
          name: "لپ‌تاپ",
          slug: "laptop",
          description: "لپ‌تاپ و نوت‌بوک",
          icon: "💻",
          parentId: "cat-1",
          isActive: true,
        },
        {
          id: "cat-1-3",
          name: "تبلت",
          slug: "tablet",
          description: "تبلت و آیپد",
          icon: "📱",
          parentId: "cat-1",
          isActive: true,
        },
      ],
    };

    const response: ApiResponse<{ category: Category }> = {
      success: true,
      message: "دسته‌بندی با موفقیت دریافت شد",
      data: { category: mockCategory },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت دسته‌بندی",
    });
  }
});

// Create new category (admin only)
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "فقط مدیران می‌توانند دسته‌بندی ایجاد کنند",
      });
    }

    const validatedData = createCategorySchema.parse(req.body);

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');

    // Mock category creation
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: validatedData.name,
      slug: `${slug}-${Date.now()}`,
      description: validatedData.description,
      icon: validatedData.icon,
      image: validatedData.image,
      parentId: validatedData.parentId,
      isActive: true,
    };

    const response: ApiResponse<{ category: Category }> = {
      success: true,
      message: "دسته‌بندی با موفقیت ایجاد شد",
      data: { category: newCategory },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating category:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "اطلاعات دسته‌بندی نامعتبر است",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطا در ایجاد دسته‌بندی",
    });
  }
});

// Update category (admin only)
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "فقط مدیران می‌توانند دسته‌بندی ویرایش کنند",
      });
    }

    const validatedData = updateCategorySchema.parse(req.body);

    // Mock category update
    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: "دسته‌بندی با موفقیت به‌روزرسانی شد",
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating category:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "اطلاعات دسته‌بندی نامعتبر است",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطا در به‌روزرسانی دسته‌بندی",
    });
  }
});

// Delete category (admin only)
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "فقط مدیران می‌توانند دسته‌بندی حذف کنند",
      });
    }

    // Mock category deletion
    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: "دسته‌بندی با موفقیت حذف شد",
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "خطا در حذف دسته‌بندی",
    });
  }
});

// Get category attributes (for product creation)
router.get("/:id/attributes", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Mock category attributes
    const mockAttributes = [
      {
        id: "attr-1",
        categoryId: id,
        name: "برند",
        type: "select",
        options: ["سامسونگ", "اپل", "شیائومی", "هوآوی"],
        isRequired: true,
        sortOrder: 1,
      },
      {
        id: "attr-2",
        categoryId: id,
        name: "رم",
        type: "select",
        options: ["4 گیگابایت", "6 گیگابایت", "8 گیگابایت", "12 گیگابایت"],
        isRequired: true,
        sortOrder: 2,
      },
      {
        id: "attr-3",
        categoryId: id,
        name: "حافظه داخلی",
        type: "select",
        options: ["64 گیگابایت", "128 گیگابایت", "256 گیگابایت", "512 گیگابایت"],
        isRequired: true,
        sortOrder: 3,
      },
      {
        id: "attr-4",
        categoryId: id,
        name: "رنگ",
        type: "multiselect",
        options: ["مشکی", "سفید", "آبی", "قرمز", "طلایی", "نقره‌ای"],
        isRequired: false,
        sortOrder: 4,
      },
      {
        id: "attr-5",
        categoryId: id,
        name: "گارانتی",
        type: "text",
        isRequired: true,
        sortOrder: 5,
      },
    ];

    const response: ApiResponse<{ attributes: any[] }> = {
      success: true,
      message: "ویژگی‌های دسته‌بندی با موفقیت دریافت شد",
      data: { attributes: mockAttributes },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching category attributes:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت ویژگی‌های دسته‌بندی",
    });
  }
});

export default router;