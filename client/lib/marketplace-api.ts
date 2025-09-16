import type {
  Product,
  Category,
  Order,
  User,
  CreateProductRequest,
  CreateOrderRequest,
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  ProductFilters,
  ProductSearchResponse,
} from "@shared/api";

class MarketplaceApiService {
  private baseURL = "/api/marketplace";

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem("marketplace_token");

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در درخواست");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      localStorage.setItem("marketplace_token", response.data.token);
      localStorage.setItem("marketplace_user", JSON.stringify(response.data.user));
    }

    return response;
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      localStorage.setItem("marketplace_token", response.data.token);
      localStorage.setItem("marketplace_user", JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request("/auth/logout", {
      method: "POST",
    });

    if (response.success) {
      localStorage.removeItem("marketplace_token");
      localStorage.removeItem("marketplace_user");
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>("/auth/me");
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse> {
    return this.request("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(userData),
    });
  }

  async sendPhoneVerification(phone: string): Promise<ApiResponse> {
    return this.request("/auth/verify-phone/send", {
      method: "POST",
      body: JSON.stringify({ phone }),
    });
  }

  async verifyPhone(phone: string, code: string): Promise<ApiResponse> {
    return this.request("/auth/verify-phone", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    });
  }

  async resetPassword(email: string): Promise<ApiResponse> {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // Product methods
  async getProducts(filters?: ProductFilters): Promise<ApiResponse<ProductSearchResponse>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return this.request<ProductSearchResponse>(endpoint);
  }

  async getProduct(id: string): Promise<ApiResponse<{ product: Product }>> {
    return this.request<{ product: Product }>(`/products/${id}`);
  }

  async createProduct(productData: CreateProductRequest): Promise<ApiResponse<{ product: Product }>> {
    return this.request<{ product: Product }>("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: Partial<CreateProductRequest>): Promise<ApiResponse> {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  async getProductReviews(productId: string, page = 1, limit = 10): Promise<ApiResponse<{
    reviews: any[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>> {
    return this.request(`/products/${productId}/reviews?page=${page}&limit=${limit}`);
  }

  // Category methods
  async getCategories(includeInactive = false, parentId?: string): Promise<ApiResponse<{ categories: Category[] }>> {
    const queryParams = new URLSearchParams();
    if (includeInactive) queryParams.append("includeInactive", "true");
    if (parentId) queryParams.append("parentId", parentId);

    const endpoint = `/categories${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return this.request<{ categories: Category[] }>(endpoint);
  }

  async getCategory(id: string): Promise<ApiResponse<{ category: Category }>> {
    return this.request<{ category: Category }>(`/categories/${id}`);
  }

  async getCategoryAttributes(categoryId: string): Promise<ApiResponse<{ attributes: any[] }>> {
    return this.request<{ attributes: any[] }>(`/categories/${categoryId}/attributes`);
  }

  // Order methods
  async getOrders(page = 1, limit = 10, status?: string): Promise<ApiResponse<{
    orders: Order[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>> {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (status) queryParams.append("status", status);

    const endpoint = `/orders?${queryParams.toString()}`;
    return this.request(endpoint);
  }

  async getSellerOrders(page = 1, limit = 10, status?: string): Promise<ApiResponse<{ orders: Order[] }>> {
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (status) queryParams.append("status", status);

    const endpoint = `/orders/seller?${queryParams.toString()}`;
    return this.request<{ orders: Order[] }>(endpoint);
  }

  async getOrder(id: string): Promise<ApiResponse<{ order: Order }>> {
    return this.request<{ order: Order }>(`/orders/${id}`);
  }

  async createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<{
    order: Order;
    paymentUrl?: string;
  }>> {
    return this.request<{ order: Order; paymentUrl?: string }>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async updateOrderStatus(orderId: string, status: string, trackingCode?: string, notes?: string): Promise<ApiResponse> {
    return this.request(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        trackingCode,
        sellerNotes: notes,
      }),
    });
  }

  async cancelOrder(orderId: string): Promise<ApiResponse> {
    return this.request(`/orders/${orderId}/cancel`, {
      method: "PATCH",
    });
  }

  async trackOrder(orderNumber: string): Promise<ApiResponse<{ tracking: any }>> {
    return this.request<{ tracking: any }>(`/orders/track/${orderNumber}`);
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem("marketplace_token");
  }

  getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem("marketplace_user");
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem("marketplace_token");
  }
}

export const marketplaceApi = new MarketplaceApiService();
export default marketplaceApi;