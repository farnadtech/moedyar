/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Marketplace API Types

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

// User & Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: 'BUYER' | 'SELLER';
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  isVerified: boolean;
  avatar?: string;
  createdAt: string;
}

// Products
export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount: number;
  stock: number;
  images: string[];
  videos?: string[];
  specifications?: Record<string, any>;
  category: Category;
  brand?: Brand;
  seller: SellerProfile;
  rating: number;
  reviewCount: number;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface CreateProductRequest {
  title: string;
  description?: string;
  shortDescription?: string;
  categoryId: string;
  brandId?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  videos?: string[];
  specifications?: Record<string, any>;
}

// Categories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  isActive: boolean;
}

// Brands
export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  isActive: boolean;
}

// Seller
export interface SellerProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType?: string;
  description?: string;
  logo?: string;
  banner?: string;
  rating: number;
  totalSales: number;
  totalRevenue: number;
  isActive: boolean;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

// Orders
export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'HELD_IN_ESCROW';
  items: OrderItem[];
  shippingAddress: any;
  trackingCode?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  product: Product;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  addressId: string;
  couponCode?: string;
}

// Reviews
export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
  isApproved: boolean;
  helpfulCount: number;
  user: User;
  createdAt: string;
}

export interface CreateReviewRequest {
  productId: string;
  orderId: string;
  rating: number;
  title?: string;
  comment?: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
}

// Addresses
export interface Address {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  state: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
}

// Cart
export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  stock: number;
  attributes?: Record<string, any>;
}

// Coupons
export interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

// Search & Filtering
export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  rating?: number;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
  page?: number;
  limit?: number;
}

export interface ProductSearchResponse {
  products: Product[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filters: {
    categories: Category[];
    brands: Brand[];
    priceRange: { min: number; max: number };
  };
}

// Notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// Support
export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  messages: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  message: string;
  attachments?: string[];
  isFromAdmin: boolean;
  createdAt: string;
}

// Disputes
export interface Dispute {
  id: string;
  orderId: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  createdAt: string;
  messages: DisputeMessage[];
}

export interface DisputeMessage {
  id: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

// Analytics (for seller dashboard)
export interface SellerAnalytics {
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    product: Product;
    salesCount: number;
    revenue: number;
  }>;
  recentOrders: Order[];
  monthlyStats: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
}

// Admin Analytics
export interface AdminAnalytics {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeDisputes: number;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}
