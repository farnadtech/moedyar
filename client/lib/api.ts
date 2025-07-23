// API service for communicating with backend

const API_BASE_URL = "/api";

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
  upgradeRequired?: boolean;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem("authToken");
  }

  // Alternative fetch method that bypasses some browser extension blocking
  private async alternativeFetch(url: string, config: RequestInit): Promise<Response> {
    // Try using a different fetch approach first
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
        cache: 'no-store',
        credentials: 'same-origin'
      });
      clearTimeout(timeoutId);
      return response;
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  }

  // Fallback fetch using XMLHttpRequest for when browser extensions block fetch
  private async fallbackFetch(url: string, config: RequestInit): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(config.method || 'GET', url, true);

      // Set headers
      if (config.headers) {
        Object.entries(config.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value as string);
        });
      }

      xhr.onload = () => {
        // Create a response-like object that includes the ok property
        const responseHeaders = new Headers();
        const response = {
          ok: xhr.status >= 200 && xhr.status < 300,
          status: xhr.status,
          statusText: xhr.statusText,
          headers: responseHeaders,
          json: async () => {
            try {
              return JSON.parse(xhr.responseText);
            } catch (e) {
              throw new Error('Invalid JSON response');
            }
          },
          text: async () => xhr.responseText
        } as Response;
        resolve(response);
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.ontimeout = () => reject(new Error('Request timeout'));

      xhr.timeout = 30000; // 30 second timeout
      xhr.send(config.body as string);
    });
  }

  private setAuthToken(token: string): void {
    localStorage.setItem("authToken", token);
  }

  private removeAuthToken(): void {
    localStorage.removeItem("authToken");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0,
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();

    const config: RequestInit = {
      method: "GET",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    } catch (fetchError) {
      console.log("Standard fetch failed, trying alternative fetch...", fetchError);
      try {
        response = await this.alternativeFetch(`${API_BASE_URL}${endpoint}`, config);
        console.log("Alternative fetch succeeded");
      } catch (altFetchError) {
        console.log("Alternative fetch failed, trying XMLHttpRequest fallback...", altFetchError);
        try {
          response = await this.fallbackFetch(`${API_BASE_URL}${endpoint}`, config);
          console.log("XMLHttpRequest fallback succeeded");
        } catch (fallbackError) {
          console.error("All fetch methods failed:", {
            fetchError,
            altFetchError,
            fallbackError
          });
          // Create a custom error that explains the situation
          throw new Error("Network request failed: Browser extensions may be blocking API calls. Please disable ad blockers or privacy extensions and try again.");
        }
      }
    }

    try {

      // Handle authentication errors first
      if (response.status === 401 || response.status === 403) {
        this.removeAuthToken();
        window.location.href = "/login";
        return {
          success: false,
          message: "��یاز به احراز هویت مجدد",
        };
      }

      // Handle non-ok responses first
      if (!response.ok) {
        try {
          // Try to get error details from JSON
          const errorData = await response.json();
          return errorData;
        } catch {
          // If not JSON, return generic error
          return {
            success: false,
            message: `خطای سرور: ${response.status} - ${response.statusText}`,
          };
        }
      }

      // For ok responses, try to parse as JSON
      try {
        const data: ApiResponse<T> = await response.json();
        return data;
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError);
        return {
          success: false,
          message: "پاسخ سرور قابل تجزیه نیست",
        };
      }
    } catch (error) {
      // Check if it's a network/fetch error (often caused by browser extensions)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.warn(
          "Network fetch error (possibly due to browser extensions):",
          error.message,
        );
        console.log("API Request Error:", error);

        // For critical auth endpoints, offer to auto-reload the page
        if (endpoint.includes("/auth/me")) {
          // For auth endpoints, offer auto-reload after a delay
          setTimeout(() => {
            if (confirm("خطا در ارتباط با سرور. آیا می‌خواهید صفحه را مجدداً بارگذاری کنید؟")) {
              window.location.reload();
            }
          }, 2000);

          return {
            success: false,
            message:
              "خطا در ارتباط با سرور - احتمالاً به دلیل افزونه‌های مرورگر. صفحه به زودی مجدداً بارگذاری خواهد شد.",
          };
        }

        // For other endpoints, provide helpful error message
        if (endpoint.includes("/teams/")) {
          return {
            success: false,
            message:
              "خطا در ارتباط با سرور - این ممکن است به دلیل مسدودسازی توسط افزونه‌های مرورگر باشد. لطفاً صفحه را مجدداً بارگذاری کنید یا افزونه‌های مرورگر را موقتاً غیرفعال کنید.",
          };
        }
      }

      // Retry mechanism for any network errors (browser extension interference)
      if ((error instanceof TypeError || error.message.includes("Network request failed")) && retryCount < 2) {
        console.log(`Retrying API request (attempt ${retryCount + 1}): ${endpoint}`);
        // Wait a short time before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      console.error("API Request Error:", error);
      return {
        success: false,
        message: "خطا در ارتباط با سرور",
      };
    }
  }

  // Auth Methods
  async register(userData: {
    fullName: string;
    email: string;
    password: string;
    accountType?: "PERSONAL" | "BUSINESS";
    inviteToken?: string;
  }): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await this.request<{ user: any; token: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(userData),
      },
    );

    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await this.request<{ user: any; token: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
    );

    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: any }>> {
    return this.request<{ user: any }>("/auth/me");
  }

  async updateProfile(profileData: {
    fullName: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: any }>> {
    return this.request<{ user: any }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  logout(): void {
    this.removeAuthToken();
    window.location.href = "/";
  }

  // Event Methods
  async getEvents(): Promise<ApiResponse<{ events: any[] }>> {
    return this.request<{ events: any[] }>("/events");
  }

  async getEvent(id: string): Promise<ApiResponse<{ event: any }>> {
    return this.request<{ event: any }>(`/events/${id}`);
  }

  async createEvent(eventData: {
    title: string;
    description?: string;
    eventDate: string;
    eventTime?: string;
    eventType?: string;
    reminderDays?: number[];
    reminderMethods?: string[];
  }): Promise<ApiResponse<{ event: any }>> {
    return this.request<{ event: any }>("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(
    id: string,
    eventData: Partial<{
      title: string;
      description?: string;
      eventDate: string;
      eventTime?: string;
      eventType?: string;
      reminderDays?: number[];
      reminderMethods?: string[];
    }>,
  ): Promise<ApiResponse<{ event: any }>> {
    return this.request<{ event: any }>(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string): Promise<ApiResponse> {
    return this.request(`/events/${id}`, {
      method: "DELETE",
    });
  }

  async getEventStats(): Promise<ApiResponse<{ stats: any }>> {
    return this.request<{ stats: any }>("/events/stats/overview");
  }

  // Subscription Methods
  async getCurrentSubscription(): Promise<
    ApiResponse<{
      subscription: any;
      currentType: string;
      eventCount: number;
      limits: any;
    }>
  > {
    return this.request<{
      subscription: any;
      currentType: string;
      eventCount: number;
      limits: any;
    }>("/subscriptions/current");
  }

  async getSubscriptionPlans(): Promise<ApiResponse<{ plans: any }>> {
    return this.request<{ plans: any }>("/subscriptions/plans");
  }

  async upgradeSubscription(planType: "PREMIUM" | "BUSINESS"): Promise<
    ApiResponse<{
      subscriptionId: string;
      amount: number;
      paymentUrl: string;
    }>
  > {
    return this.request<{
      subscriptionId: string;
      amount: number;
      paymentUrl: string;
    }>("/subscriptions/upgrade", {
      method: "POST",
      body: JSON.stringify({ planType }),
    });
  }

  async confirmPayment(
    subscriptionId: string,
    paymentStatus: "success" | "failed",
  ): Promise<ApiResponse> {
    return this.request("/subscriptions/confirm-payment", {
      method: "POST",
      body: JSON.stringify({ subscriptionId, paymentStatus }),
    });
  }

  async cancelSubscription(): Promise<ApiResponse> {
    return this.request("/subscriptions/cancel", {
      method: "POST",
    });
  }

  // Notification Methods
  async testNotification(
    method: "EMAIL" | "SMS" | "WHATSAPP" = "EMAIL",
  ): Promise<ApiResponse> {
    return this.request("/notifications/test", {
      method: "POST",
      body: JSON.stringify({ method }),
    });
  }

  async triggerNotificationCheck(): Promise<ApiResponse> {
    return this.request("/notifications/trigger-check", {
      method: "POST",
    });
  }

  // Admin Methods
  async getAdminStats(): Promise<ApiResponse<any>> {
    return this.request<any>("/admin/stats");
  }

  async getUsers(
    page: number = 1,
    limit: number = 10,
    search: string = "",
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    return this.request<any>(`/admin/users?${params}`);
  }

  async getUserDetails(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/users/${userId}`);
  }

  async updateUserSubscription(
    userId: string,
    subscriptionType: string,
  ): Promise<ApiResponse> {
    return this.request(`/admin/users/${userId}/subscription`, {
      method: "PUT",
      body: JSON.stringify({ subscriptionType }),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    return this.request(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  }

  async getAdminActivities(): Promise<ApiResponse<any>> {
    return this.request<any>("/admin/activities");
  }

  async getAdminEvents(
    page: number = 1,
    limit: number = 20,
    search: string = "",
    eventType: string = "",
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(eventType && { eventType }),
    });
    return this.request<any>(`/admin/events?${params}`);
  }

  async getAdminTransactions(
    page: number = 1,
    limit: number = 20,
    search: string = "",
    status: string = "",
  ): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
    });
    return this.request<any>(`/admin/transactions?${params}`);
  }

  // System Configuration Methods
  async getSystemConfig(): Promise<ApiResponse<any>> {
    return this.request<any>("/config/system");
  }

  async updateSystemConfig(
    config: any,
    section?: string,
  ): Promise<ApiResponse> {
    return this.request("/config/system", {
      method: "PUT",
      body: JSON.stringify({ config, section }),
    });
  }

  async testSystemService(
    service: "email" | "sms" | "whatsapp" | "zarinpal",
  ): Promise<ApiResponse> {
    return this.request(`/config/test/${service}`, {
      method: "POST",
    });
  }

  // Get invitation info by token
  async getInvitationInfo(token: string): Promise<
    ApiResponse<{
      email: string;
      teamName: string;
      inviterName: string;
      expiresAt: string;
    }>
  > {
    return this.request<{
      email: string;
      teamName: string;
      inviterName: string;
      expiresAt: string;
    }>(`/teams/invitation/${token}`);
  }

  // Team Methods
  async createTeam(teamData: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<{ team: any }>> {
    return this.request<{ team: any }>("/teams/create", {
      method: "POST",
      body: JSON.stringify(teamData),
    });
  }

  async getTeamInfo(): Promise<ApiResponse<{ team: any }>> {
    return this.request<{ team: any }>("/teams/info");
  }

  async getTeamEvents(): Promise<ApiResponse<{ events: any[] }>> {
    return this.request<{ events: any[] }>("/teams/events");
  }

  async inviteTeamMember(memberData: {
    email: string;
    role?: "ADMIN" | "MEMBER" | "VIEWER";
  }): Promise<ApiResponse<{ membership: any }>> {
    return this.request<{ membership: any }>("/teams/invite", {
      method: "POST",
      body: JSON.stringify(memberData),
    });
  }

  async getTeamEvents(): Promise<ApiResponse<{ events: any[] }>> {
    return this.request<{ events: any[] }>("/teams/events");
  }

  async removeTeamMember(memberId: string): Promise<ApiResponse> {
    return this.request(`/teams/members/${memberId}`, {
      method: "DELETE",
    });
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const apiService = new ApiService();
export default apiService;
