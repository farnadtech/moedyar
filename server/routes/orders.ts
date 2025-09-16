import { Router, Request, Response } from "express";
import { db } from "../lib/db";
import { z } from "zod";
import type { Order, CreateOrderRequest, ApiResponse } from "@shared/api";

const router = Router();

// Order validation schemas
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid("شناسه محصول نامعتبر است"),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().positive("تعداد باید مثبت باشد"),
  })).min(1, "حداقل یک محصول الزامی است"),
  addressId: z.string().uuid("شناسه آدرس نامعتبر است"),
  couponCode: z.string().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']),
  trackingCode: z.string().optional(),
  sellerNotes: z.string().optional(),
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
  (req as any).user = { id: "mock-user-id", role: "BUYER" };
  next();
};

// Get user orders (buyer)
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    // Mock orders data
    const mockOrders: Order[] = Array.from({ length: limit }, (_, i) => ({
      id: `order-${i + 1}`,
      orderNumber: `ORD-${Date.now()}-${i + 1}`,
      buyerId: user.id,
      sellerId: `seller-${(i % 3) + 1}`,
      subtotal: 250000 + (i * 50000),
      shippingCost: 15000,
      tax: 0,
      discount: i === 0 ? 25000 : 0,
      total: 250000 + (i * 50000) + 15000 - (i === 0 ? 25000 : 0),
      status: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'][i % 4] as any,
      paymentStatus: ['PENDING', 'PAID', 'PAID', 'PAID'][i % 4] as any,
      items: [
        {
          id: `item-${i + 1}-1`,
          productId: `product-${i + 1}`,
          quantity: 1,
          price: 250000 + (i * 50000),
          discount: i === 0 ? 25000 : 0,
          total: 250000 + (i * 50000) - (i === 0 ? 25000 : 0),
          product: {
            id: `product-${i + 1}`,
            title: `محصول شماره ${i + 1}`,
            slug: `product-${i + 1}`,
            images: [`/images/product-${i + 1}.jpg`],
            price: 250000 + (i * 50000),
            originalPrice: i === 0 ? 275000 : undefined,
            discount: i === 0 ? 9 : 0,
            stock: 10,
            rating: 4.2,
            reviewCount: 23,
            status: 'ACTIVE' as const,
            category: {
              id: "cat-1",
              name: "موبایل",
              slug: "mobile",
              isActive: true,
            },
            seller: {
              id: `seller-${(i % 3) + 1}`,
              userId: `user-${(i % 3) + 1}`,
              businessName: `فروشگاه ${(i % 3) + 1}`,
              rating: 4.5,
              totalSales: 100,
              totalRevenue: 5000000,
              isActive: true,
              verificationStatus: 'VERIFIED' as const,
            },
            createdAt: new Date().toISOString(),
          },
        },
      ],
      shippingAddress: {
        fullName: "علی محمدی",
        phone: "09123456789",
        state: "تهران",
        city: "تهران",
        address: "خیابان ولیعصر، پلاک 123",
        postalCode: "1234567890",
      },
      trackingCode: i > 1 ? `TR${Date.now()}${i}` : undefined,
      createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
    }));

    // Filter by status if provided
    const filteredOrders = status 
      ? mockOrders.filter(order => order.status === status)
      : mockOrders;

    const totalCount = 25; // Mock total count
    const totalPages = Math.ceil(totalCount / limit);

    const response: ApiResponse<{
      orders: Order[];
      totalCount: number;
      currentPage: number;
      totalPages: number;
    }> = {
      success: true,
      message: "سفارشات با موفقیت دریافت شد",
      data: {
        orders: filteredOrders,
        totalCount,
        currentPage: page,
        totalPages,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت سفارشات",
    });
  }
});

// Get seller orders (seller)
router.get("/seller", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        message: "فقط فروشندگان می‌توانند سفارشات خود را مشاهده کنند",
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;

    // Mock seller orders data
    const mockOrders: Order[] = Array.from({ length: limit }, (_, i) => ({
      id: `order-${i + 1}`,
      orderNumber: `ORD-${Date.now()}-${i + 1}`,
      buyerId: `buyer-${i + 1}`,
      sellerId: user.id,
      subtotal: 250000 + (i * 50000),
      shippingCost: 15000,
      tax: 0,
      discount: 0,
      total: 250000 + (i * 50000) + 15000,
      status: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'][i % 4] as any,
      paymentStatus: 'PAID' as const,
      items: [
        {
          id: `item-${i + 1}-1`,
          productId: `product-${i + 1}`,
          quantity: 1 + (i % 3),
          price: 250000 + (i * 50000),
          discount: 0,
          total: (250000 + (i * 50000)) * (1 + (i % 3)),
          product: {
            id: `product-${i + 1}`,
            title: `محصول فروشنده شماره ${i + 1}`,
            slug: `seller-product-${i + 1}`,
            images: [`/images/seller-product-${i + 1}.jpg`],
            price: 250000 + (i * 50000),
            discount: 0,
            stock: 10,
            rating: 4.2,
            reviewCount: 15,
            status: 'ACTIVE' as const,
            category: {
              id: "cat-1",
              name: "موبایل",
              slug: "mobile",
              isActive: true,
            },
            seller: {
              id: user.id,
              userId: user.id,
              businessName: "فروشگاه من",
              rating: 4.7,
              totalSales: 250,
              totalRevenue: 15000000,
              isActive: true,
              verificationStatus: 'VERIFIED' as const,
            },
            createdAt: new Date().toISOString(),
          },
        },
      ],
      shippingAddress: {
        fullName: `خریدار ${i + 1}`,
        phone: `0912345678${i}`,
        state: "تهران",
        city: "تهران",
        address: `آدرس خریدار ${i + 1}`,
        postalCode: `123456789${i}`,
      },
      createdAt: new Date(Date.now() - (i * 12 * 60 * 60 * 1000)).toISOString(),
    }));

    const response: ApiResponse<{ orders: Order[] }> = {
      success: true,
      message: "سفارشات فروشنده با موفقیت دریافت شد",
      data: { orders: mockOrders },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت سفارشات فروشنده",
    });
  }
});

// Get single order by ID
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    // Mock order data
    const mockOrder: Order = {
      id: id,
      orderNumber: `ORD-${Date.now()}`,
      buyerId: "buyer-1",
      sellerId: "seller-1",
      subtotal: 1290000,
      shippingCost: 25000,
      tax: 0,
      discount: 50000,
      total: 1265000,
      status: 'SHIPPED',
      paymentStatus: 'PAID',
      items: [
        {
          id: "item-1",
          productId: "product-1",
          quantity: 1,
          price: 1290000,
          discount: 50000,
          total: 1240000,
          product: {
            id: "product-1",
            title: "گوشی موبایل سامسونگ گلکسی A54 5G",
            slug: "samsung-galaxy-a54-5g",
            description: "گوشی موبایل با کیفیت عالی",
            images: ["/images/samsung-a54.jpg"],
            price: 1290000,
            originalPrice: 1340000,
            discount: 4,
            stock: 15,
            rating: 4.3,
            reviewCount: 127,
            status: 'ACTIVE',
            category: {
              id: "cat-1",
              name: "موبایل",
              slug: "mobile",
              isActive: true,
            },
            seller: {
              id: "seller-1",
              userId: "user-seller-1",
              businessName: "فروشگاه موبایل پارس",
              businessType: "خرده‌فروشی",
              rating: 4.8,
              totalSales: 1250,
              totalRevenue: 45000000,
              isActive: true,
              verificationStatus: 'VERIFIED',
            },
            createdAt: new Date().toISOString(),
          },
        },
      ],
      shippingAddress: {
        fullName: "علی محمدی",
        phone: "09123456789",
        state: "تهران",
        city: "تهران",
        address: "خیابان ولیعصر، نرسیده به میدان ونک، پلاک 123، واحد 45",
        postalCode: "1991735844",
      },
      trackingCode: "TR1234567890",
      createdAt: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
    };

    // Check if user has access to this order
    if (user.role === "BUYER" && mockOrder.buyerId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "شما مجاز به مشاهده این سفارش نیستید",
      });
    }

    if (user.role === "SELLER" && mockOrder.sellerId !== user.id) {
      return res.status(403).json({
        success: false,
        message: "شما مجاز به مشاهده این سفارش نیستید",
      });
    }

    const response: ApiResponse<{ order: Order }> = {
      success: true,
      message: "سفارش با موفقیت دریافت شد",
      data: { order: mockOrder },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "خطا در دریافت سفارش",
    });
  }
});

// Create new order (buyer)
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== "BUYER") {
      return res.status(403).json({
        success: false,
        message: "فقط خریداران می‌توانند سفارش ثبت کنند",
      });
    }

    const validatedData = createOrderSchema.parse(req.body);

    // Mock order creation
    const orderNumber = `ORD-${Date.now()}`;
    const subtotal = validatedData.items.reduce((sum, item) => sum + (250000 * item.quantity), 0);
    const shippingCost = 25000;
    const discount = validatedData.couponCode ? 50000 : 0;
    const total = subtotal + shippingCost - discount;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      buyerId: user.id,
      sellerId: "seller-1", // In real implementation, get from product
      subtotal,
      shippingCost,
      tax: 0,
      discount,
      total,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      items: validatedData.items.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: 250000,
        discount: 0,
        total: 250000 * item.quantity,
        product: {
          id: item.productId,
          title: "محصول نمونه",
          slug: "sample-product",
          images: ["/images/sample.jpg"],
          price: 250000,
          discount: 0,
          stock: 10,
          rating: 4.2,
          reviewCount: 23,
          status: 'ACTIVE' as const,
          category: {
            id: "cat-1",
            name: "موبایل",
            slug: "mobile",
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
            verificationStatus: 'VERIFIED' as const,
          },
          createdAt: new Date().toISOString(),
        },
      })),
      shippingAddress: {
        fullName: "علی محمدی",
        phone: "09123456789",
        state: "تهران",
        city: "تهران",
        address: "آدرس نمونه",
        postalCode: "1234567890",
      },
      createdAt: new Date().toISOString(),
    };

    const response: ApiResponse<{ 
      order: Order;
      paymentUrl?: string;
    }> = {
      success: true,
      message: "سفارش با موفقیت ثبت شد",
      data: { 
        order: newOrder,
        paymentUrl: `/payment/${newOrder.id}`, // Mock payment URL
      },
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating order:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "اطلاعات سفارش نامعتبر است",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطا در ثبت سفارش",
    });
  }
});

// Update order status (seller)
router.patch("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (user.role !== "SELLER") {
      return res.status(403).json({
        success: false,
        message: "فقط فروشندگان می‌توانند وضعیت سفارش را تغییر دهند",
      });
    }

    const validatedData = updateOrderStatusSchema.parse(req.body);

    // Mock order status update
    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: "وضعیت سفارش با موفقیت به‌روزرسانی شد",
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating order status:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "اطلاعات وضعیت نامعتبر است",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "خطا در به‌روزرسانی وضعیت سفارش",
    });
  }
});

// Cancel order (buyer)
router.patch("/:id/cancel", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    
    if (user.role !== "BUYER") {
      return res.status(403).json({
        success: false,
        message: "فقط خریداران می‌توانند سفارش خود را لغو کنند",
      });
    }

    // Mock order cancellation
    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: "سفارش با موفقیت لغو شد",
    };

    res.json(response);
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "خطا در لغو سفارش",
    });
  }
});

// Track order (public with order number)
router.get("/track/:orderNumber", async (req: Request, res: Response) => {
  try {
    const { orderNumber } = req.params;

    // Mock tracking data
    const trackingInfo = {
      orderNumber,
      status: 'SHIPPED',
      trackingCode: 'TR1234567890',
      timeline: [
        {
          status: 'PENDING',
          title: 'سفارش ثبت شد',
          description: 'سفارش شما با موفقیت ثبت شد',
          timestamp: new Date(Date.now() - (4 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
          status: 'CONFIRMED',
          title: 'تایید سفارش',
          description: 'سفارش توسط فروشنده تایید شد',
          timestamp: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
          status: 'PROCESSING',
          title: 'در حال آماده‌سازی',
          description: 'سفارش در حال آماده‌سازی برای ارسال است',
          timestamp: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
        },
        {
          status: 'SHIPPED',
          title: 'ارسال شد',
          description: 'سفارش به شرکت حمل‌ونقل تحویل داده شد',
          timestamp: new Date(Date.now() - (1 * 24 * 60 * 60 * 1000)).toISOString(),
        },
      ],
      estimatedDelivery: new Date(Date.now() + (1 * 24 * 60 * 60 * 1000)).toISOString(),
    };

    const response: ApiResponse<{ tracking: any }> = {
      success: true,
      message: "اطلاعات پیگیری با موفقیت دریافت شد",
      data: { tracking: trackingInfo },
    };

    res.json(response);
  } catch (error) {
    console.error("Error tracking order:", error);
    res.status(500).json({
      success: false,
      message: "خطا در پیگیری سفارش",
    });
  }
});

export default router;