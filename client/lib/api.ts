// API service for communicating with backend

const API_BASE_URL = '/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
  upgradeRequired?: boolean;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  private removeAuthToken(): void {
    localStorage.removeItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();

    const config: RequestInit = {
      method: 'GET',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        return {
          success: false,
          message: 'سرور پاسخ نامعتبر ارسال کرد'
        };
      }

      const data: ApiResponse<T> = await response.json();

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        this.removeAuthToken();
        window.location.href = '/login';
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        message: 'خطا در ارتباط با سرور'
      };
    }
  }

  // Auth Methods
  async register(userData: {
    fullName: string;
    email: string;
    password: string;
    accountType?: 'PERSONAL' | 'BUSINESS';
  }): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data?.token) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: any }>> {
    return this.request<{ user: any }>('/auth/me');
  }

  async updateProfile(profileData: {
    fullName: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: any }>> {
    return this.request<{ user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  logout(): void {
    this.removeAuthToken();
    window.location.href = '/';
  }

  // Event Methods
  async getEvents(): Promise<ApiResponse<{ events: any[] }>> {
    return this.request<{ events: any[] }>('/events');
  }

  async getEvent(id: string): Promise<ApiResponse<{ event: any }>> {
    return this.request<{ event: any }>(`/events/${id}`);
  }

  async createEvent(eventData: {
    title: string;
    description?: string;
    eventDate: string;
    eventType?: string;
    reminderDays?: number[];
    reminderMethods?: string[];
  }): Promise<ApiResponse<{ event: any }>> {
    return this.request<{ event: any }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async updateEvent(id: string, eventData: Partial<{
    title: string;
    description?: string;
    eventDate: string;
    eventType?: string;
    reminderDays?: number[];
    reminderMethods?: string[];
  }>): Promise<ApiResponse<{ event: any }>> {
    return this.request<{ event: any }>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  }

  async deleteEvent(id: string): Promise<ApiResponse> {
    return this.request(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async getEventStats(): Promise<ApiResponse<{ stats: any }>> {
    return this.request<{ stats: any }>('/events/stats/overview');
  }

  // Subscription Methods
  async getCurrentSubscription(): Promise<ApiResponse<{ 
    subscription: any; 
    currentType: string; 
    eventCount: number; 
    limits: any; 
  }>> {
    return this.request<{ 
      subscription: any; 
      currentType: string; 
      eventCount: number; 
      limits: any; 
    }>('/subscriptions/current');
  }

  async getSubscriptionPlans(): Promise<ApiResponse<{ plans: any }>> {
    return this.request<{ plans: any }>('/subscriptions/plans');
  }

  async upgradeSubscription(planType: 'PREMIUM' | 'BUSINESS'): Promise<ApiResponse<{
    subscriptionId: string;
    amount: number;
    paymentUrl: string;
  }>> {
    return this.request<{
      subscriptionId: string;
      amount: number;
      paymentUrl: string;
    }>('/subscriptions/upgrade', {
      method: 'POST',
      body: JSON.stringify({ planType }),
    });
  }

  async confirmPayment(subscriptionId: string, paymentStatus: 'success' | 'failed'): Promise<ApiResponse> {
    return this.request('/subscriptions/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ subscriptionId, paymentStatus }),
    });
  }

  async cancelSubscription(): Promise<ApiResponse> {
    return this.request('/subscriptions/cancel', {
      method: 'POST',
    });
  }

  // Notification Methods
  async testNotification(method: 'EMAIL' | 'SMS' | 'WHATSAPP' = 'EMAIL'): Promise<ApiResponse> {
    return this.request('/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ method }),
    });
  }

  async triggerNotificationCheck(): Promise<ApiResponse> {
    return this.request('/notifications/trigger-check', {
      method: 'POST',
    });
  }

  // Admin Methods
  async getAdminStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/stats');
  }

  async getUsers(page: number = 1, limit: number = 10, search: string = ''): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    return this.request<any>(`/admin/users?${params}`);
  }

  async getUserDetails(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/admin/users/${userId}`);
  }

  async updateUserSubscription(userId: string, subscriptionType: string): Promise<ApiResponse> {
    return this.request(`/admin/users/${userId}/subscription`, {
      method: 'PUT',
      body: JSON.stringify({ subscriptionType }),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getAdminActivities(): Promise<ApiResponse<any>> {
    return this.request<any>('/admin/activities');
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const apiService = new ApiService();
export default apiService;
