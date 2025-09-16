import { Router, Request, Response } from "express";
import { db } from "../lib/db";
import { z } from "zod";
import type { ProductFilters, Product, ApiResponse } from "@shared/api";

const router = Router();

// Product validation schemas
const createProductSchema = z.object({
  title: z.string().min(1, "عنوان محصول الزامی است"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  categoryId: z.string().uuid("شناسه دسته‌بندی نامعتبر است"),
  brandId: z.string().uuid().optional(),
  price: z.number().positive("قیمت باید مثبت باشد"),
  originalPrice: z.number().positive().optional(),
  stock: z.number().int().min(0, "موجودی نمی‌تواند منفی باشد"),
  images: z.array(z.string().url()).min(1, "حداقل یک تصویر الزامی است"),
  videos: z.array(z.string().url()).optional(),
  specifications: z.record(z.any()).optional(),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }).optional(),
});

const updateProductSchema = createProductSchema.partial();

const productFiltersSchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  inStock: z.boolean().optional(),
  rating: z.number().min(1).max(5).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'rating', 'popular']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// Authentication middleware (simplified for now)
const requireAuth = (req: Request, res: Response, next: any) => {
  // TODO: Implement proper JWT authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "احراز هویت الزامی است",
    });
  }
  // For now, mock user
  (req as any).user = { id: "mock-user-id", role: "SELLER" };
  next();
};

// Get all products with filtering and pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const filters = productFiltersSchema.parse(req.query);
    
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: "ACTIVE",
    };

    if (filters.category) {
      where.categoryId = filters.category;
    }

    if (filters.brand) {
      where.brandId = filters.brand;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters.inStock) {
      where.stock = { gt: 0 };
    }

    if (filters.rating) {
      where.rating = { gte: filters.rating };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
        { shortDescription: { contains: filters.search } },
      ];
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: "desc" };
    
    switch (filters.sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { rating: "desc" };
        break;
      case "popular":
        orderBy = { salesCount: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Mock data since Prisma client is not available
    const mockProducts = Array.from({ length: limit }, (_, i) => ({
      id: `product-${i + 1}`,
      title: `محصول شماره ${i + 1}`,
      slug: `product-${i + 1}`,
      description: `توضیحات کامل محصول شماره ${i + 1}`,
      shortDescription: `توضیحات کوتاه محصول ${i + 1}`,
      price: 120000 + (i * 10000),
      originalPrice: 150000 + (i * 10000),
      discount: 20,
      stock: 10 + i,
      images: [`/images/product-${i + 1}.jpg`],
      videos: [],
      specifications: { brand: "نمونه", model: `مدل ${i + 1}` },
      category: {
        id: "cat-1",
        name: "موبایل",
        slug: "mobile",
        isActive: true,
      },
      brand: {
        id: "brand-1",
        name: "سامسونگ",
        slug: "samsung",
        isActive: true,
      },
      seller: {
        id: "seller-1",
        userId: "user-1",
        businessName: "فروشگاه نمونه",
        rating: 4.5,
        totalSales: 100,
        totalRevenue: 5000000,
        isActive: true,
        verificationStatus: "VERIFIED" as const,
      },
      rating: 4.2 + (i * 0.1),
      reviewCount: 23 + i,
      status: "ACTIVE" as const,
      createdAt: new Date().toISOString(),
    }));

    const totalCount = 50; // Mock total count
    const totalPages = Math.ceil(totalCount / limit);

    const response: ApiResponse<{
      products: Product[];
      totalCount: number;
      currentPage: number;
      totalPages: number;
      filters: any;
    }> = {
      success: true,
      message: "محصولات با موفقیت دریافت شد",
      data: {
        products: mockProducts,
        totalCount,
        currentPage: page,
        totalPages,
        filters: {
          categories: [
            { id: "cat-1", name: "موبایل", slug: "mobile", isActive: true },
            { id: "cat-2", name: "لپ‌تاپ", slug: "laptop", isActive: true },
          ],
          brands: [
            { id: "brand-1", name: "سامسونگ", slug: "samsung", isActive: true },
            { id: "brand-2", name: "اپل", slug: "apple", isActive: true },
          ],
          priceRange: { min: 100000, max: 2000000 },
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "فیلترهای ارسالی نامعتبر است",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطا در دریافت محصولات",
    });
  }
});

// Get single product by ID or slug
router.get("/:identifier", async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    
    // Mock product data
    const mockProduct: Product = {
      id: "product-1",
      title: "گوشی موبایل سامسونگ گلکسی A54 5G",
      slug: "samsung-galaxy-a54-5g",
      description: "گوشی موبایل سامسونگ گلکسی A54 5G با نمایشگر 6.4 اینچی Super AMOLED و پردازنده Exynos 1380",
      shortDescription: "گوشی هوشمند با کیفیت عالی و قیمت مناسب",
      price: 12900000,
      originalPrice: 15500000,
      discount: 17,
      stock: 25,
      images: [
        "/images/samsung-a54-1.jpg",
        "/images/samsung-a54-2.jpg",
        "/images/samsung-a54-3.jpg",
      ],
      videos: ["/videos/samsung-a54-review.mp4"],
      specifications: {
        "نمایشگر": "6.4 اینچ Super AMOLED",
        "پردازنده": "Exynos 1380",
        "رم": "8 گیگابایت",
        "حافظه": "256 گیگابایت",
        "دوربین": "50 مگاپیکسل",
        "باتری": "5000 میلی‌آمپر ساعت",
        "سیستم عامل": "Android 13",
      },
      category: {
        id: "cat-1",
        name: "موبایل",
        slug: "mobile",
        isActive: true,
      },
      brand: {
        id: "brand-1",
        name: "سامسونگ",
        slug: "samsung",
        isActive: true,
      },
      seller: {
        id: "seller-1",
        userId: "user-1",
        businessName: "فروشگاه موبایل پارس",
        businessType: "خرده‌فروشی",
        description: "فروشگاه معتبر موبایل با 10 سال سابقه",
        rating: 4.8,
        totalSales: 1250,
        totalRevenue: 45000000,
        isActive: true,
        verificationStatus: "VERIFIED",
      },
      rating: 4.3,
      reviewCount: 127,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    const response: ApiResponse<{ product: Product }> = {
      success: true,
      message: "محصول با موفقیت دریافت شد",
      data: { product: mockProduct },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت محصول",
    });
  }
});

// Create new product (seller only)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        message: "فقط فروشندگان می‌توانند محصول اضافه کنند",
      });
    }

    const validatedData = createProductSchema.parse(req.body);

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');

    // Mock product creation
    const newProduct: Product = {
      id: `product-${Date.now()}`,
      title: validatedData.title,
      slug: `${slug}-${Date.now()}`,
      description: validatedData.description,
      shortDescription: validatedData.shortDescription,
      price: validatedData.price,
      originalPrice: validatedData.originalPrice,
      discount: validatedData.originalPrice 
        ? Math.round(((validatedData.originalPrice - validatedData.price) / validatedData.originalPrice) * 100)
        : 0,
      stock: validatedData.stock,
      images: validatedData.images,
      videos: validatedData.videos || [],
      specifications: validatedData.specifications,
      category: {
        id: validatedData.categoryId,
        name: "دسته‌بندی نمونه",
        slug: "sample-category",
        isActive: true,
      },
      brand: validatedData.brandId ? {
        id: validatedData.brandId,
        name: "برند نمونه",
        slug: "sample-brand",
        isActive: true,
      } : undefined,
      seller: {
        id: "seller-1",
        userId: user.id,
        businessName: "فروشگاه نمونه",
        rating: 0,
        totalSales: 0,
        totalRevenue: 0,
        isActive: true,
        verificationStatus: "PENDING",
      },
      rating: 0,
      reviewCount: 0,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
    };

    const response: ApiResponse<{ product: Product }> = {
      success: true,
      message: "محصول با موفقیت ایجاد شد",
      data: { product: newProduct },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating product:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "اطلاعات محصول نامعتبر است",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطا در ایجاد محصول",
    });
  }
});

// Update product (seller only)
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (user.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        message: "فقط فروشندگان می‌توانند محصول ویرایش کنند",
      });
    }

    const validatedData = updateProductSchema.parse(req.body);

    // Mock product update
    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: "محصول با موفقیت به‌روزرسانی شد",
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating product:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "اطلاعات محصول نامعتبر است",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطا در به‌روزرسانی محصول",
    });
  }
});

// Delete product (seller only)
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (user.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        message: "فقط فروشندگان می‌توانند محصول حذف کنند",
      });
    }

    // Mock product deletion
    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: "محصول با موفقیت حذف شد",
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "خطا در حذف محصول",
    });
  }
});

// Get product reviews
router.get("/:id/reviews", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Mock reviews data
    const mockReviews = Array.from({ length: limit }, (_, i) => ({
      id: `review-${i + 1}`,
      productId: id,
      userId: `user-${i + 1}`,
      rating: 4 + (i % 2),
      title: `نظر کاربر شماره ${i + 1}`,
      comment: `این محصول واقعاً عالی است. کیفیت بسیار خوبی دارد و پیشنهاد می‌کنم.`,
      pros: ["کیفیت عالی", "قیمت مناسب", "ارسال سریع"],
      cons: ["بسته‌بندی معمولی"],
      images: [`/images/review-${i + 1}.jpg`],
      isApproved: true,
      helpfulCount: 12 + i,
      user: {
        id: `user-${i + 1}`,
        fullName: `کاربر ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: "BUYER" as const,
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
    }));

    const response: ApiResponse<{
      reviews: any[];
      totalCount: number;
      currentPage: number;
      totalPages: number;
    }> = {
      success: true,
      message: "نظرات با موفقیت دریافت شد",
      data: {
        reviews: mockReviews,
        totalCount: 45,
        currentPage: page,
        totalPages: Math.ceil(45 / limit),
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت نظرات",
    });
  }
});

export default router;