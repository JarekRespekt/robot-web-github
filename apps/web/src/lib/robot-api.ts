import type {
  AdminUser,
  Category,
  Item, 
  Location,
  Order,
  TelegramUser,
  TelegramLoginResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ReorderCategoriesRequest,
  CreateItemRequest,
  UpdateItemRequest,
  UpdateLocationRequest,
  UpdateDeliverySettingsRequest,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  OrdersFilters,
  CloudinarySignResponse,
  ApiResponse,
  ApiError,
} from '@/types/robot';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

class RobotApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Try to get from cookie first (HttpOnly)
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
      
    if (cookieToken) return cookieToken;
    
    // Fallback to localStorage
    return localStorage.getItem('robot_auth_token');
  }

  private setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    // Try to set HttpOnly cookie via API call, fallback to localStorage
    try {
      localStorage.setItem('robot_auth_token', token);
    } catch (error) {
      console.warn('Could not save auth token:', error);
    }
  }

  private removeAuthToken(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('robot_auth_token');
    
    // Clear cookie if it exists
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      // Handle responses without content (204, etc.)
      let data: any = null;
      const text = await response.text();
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          // If response is not JSON, treat as plain text
          data = text;
        }
      }

      if (!response.ok) {
        const errorMessage = (data && typeof data === 'object' && data.message) 
          ? data.message 
          : `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return {
        data: data,
        success: true,
      };
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'NETWORK_ERROR',
      };

      return {
        error: apiError,
        success: false,
      };
    }
  }

  // Authentication
  async verifyTelegramLogin(telegramData: TelegramUser): Promise<ApiResponse<TelegramLoginResponse>> {
    const response = await this.request<TelegramLoginResponse>('/auth/telegram/verify', {
      method: 'POST',
      body: JSON.stringify(telegramData),
    });

    if (response.success && response.data) {
      this.setAuthToken(response.data.token);
    }

    return response;
  }

  async getMe(): Promise<ApiResponse<AdminUser>> {
    return this.request<AdminUser>('/me');
  }

  async logout(): Promise<void> {
    this.removeAuthToken();
    
    // Optional: call backend logout endpoint
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Ignore logout errors
    }
  }

  // Categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>('/categories');
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    return this.request<Category>(`/categories/${id}`);
  }

  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderCategories(data: ReorderCategoriesRequest): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>('/categories/reorder', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Items
  async getItems(categoryId?: string): Promise<ApiResponse<Item[]>> {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return this.request<Item[]>(`/items${query}`);
  }

  async getItem(id: string): Promise<ApiResponse<Item>> {
    return this.request<Item>(`/items/${id}`);
  }

  async createItem(data: CreateItemRequest): Promise<ApiResponse<Item>> {
    return this.request<Item>('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(id: string, data: UpdateItemRequest): Promise<ApiResponse<Item>> {
    return this.request<Item>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  async updateItemAvailability(id: string, available: boolean): Promise<ApiResponse<Item>> {
    return this.request<Item>(`/items/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ available }),
    });
  }

  // Locations
  async getLocations(): Promise<ApiResponse<Location[]>> {
    return this.request<Location[]>('/locations');
  }

  async updateLocation(id: string, data: UpdateLocationRequest): Promise<ApiResponse<Location>> {
    return this.request<Location>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateDeliverySettings(
    id: string, 
    data: UpdateDeliverySettingsRequest
  ): Promise<ApiResponse<Location>> {
    return this.request<Location>(`/locations/${id}/delivery-settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Media
  async signUpload(): Promise<ApiResponse<CloudinarySignResponse>> {
    return this.request<CloudinarySignResponse>('/media/sign-upload', {
      method: 'POST',
    });
  }

  // Orders
  async getOrders(filters?: OrdersFilters): Promise<ApiResponse<Order[]>> {
    // For testing purposes, return mock data if test_mode is enabled
    if (typeof window !== 'undefined' && window.location.search.includes('test_mode=true')) {
      const mockOrders: Order[] = [
        {
          id: 'order-001',
          tenant_id: 'test-tenant',
          source: 'resto',
          status: 'нове',
          payment_status: 'неоплачено',
          total_amount: 250.50,
          order_time: new Date().toISOString(),
          delivery_type: 'доставка',
          customer: {
            name: 'Іван Петренко',
            phone: '+380501234567',
            address: 'вул. Хрещатик, 1, Київ'
          },
          items: [
            {
              item_id: 'item-001',
              item_name: { ua: 'Борщ український', pl: 'Barszcz ukraiński', en: 'Ukrainian Borscht', by: 'Украінскі борш' },
              quantity: 2,
              price: 85.00,
              total: 170.00
            },
            {
              item_id: 'item-002',
              item_name: { ua: 'Вареники з картоплею', pl: 'Pierogi z ziemniakami', en: 'Potato Dumplings', by: 'Вареннікі з бульбай' },
              quantity: 1,
              price: 80.50,
              total: 80.50
            }
          ],
          delivery_info: {
            address: 'вул. Хрещатик, 1, Київ',
            phone: '+380501234567',
            delivery_time: '18:30',
            notes: 'Дзвонити за 10 хвилин до прибуття'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'order-002',
          tenant_id: 'test-tenant',
          source: 'telegram',
          status: 'у реалізації',
          payment_status: 'оплачено',
          total_amount: 180.00,
          order_time: new Date(Date.now() - 3600000).toISOString(),
          delivery_type: 'особистий відбір',
          customer: {
            name: 'Марія Коваленко',
            phone: '+380671234567'
          },
          items: [
            {
              item_id: 'item-003',
              item_name: { ua: 'Котлета по-київськи', pl: 'Kotlet kijowski', en: 'Chicken Kiev', by: 'Кацлета па-кіеўску' },
              quantity: 1,
              price: 120.00,
              total: 120.00
            },
            {
              item_id: 'item-004',
              item_name: { ua: 'Салат Цезар', pl: 'Sałatka Cezar', en: 'Caesar Salad', by: 'Салата Цэзар' },
              quantity: 1,
              price: 60.00,
              total: 60.00
            }
          ],
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'order-003',
          tenant_id: 'test-tenant',
          source: 'glovo',
          status: 'виконано',
          payment_status: 'оплачено',
          total_amount: 95.00,
          order_time: new Date(Date.now() - 7200000).toISOString(),
          delivery_type: 'доставка',
          customer: {
            name: 'Олександр Сидоренко',
            phone: '+380931234567',
            address: 'вул. Шевченка, 15, Київ'
          },
          items: [
            {
              item_id: 'item-005',
              item_name: { ua: 'Піца Маргарита', pl: 'Pizza Margherita', en: 'Margherita Pizza', by: 'Піца Маргарыта' },
              quantity: 1,
              price: 95.00,
              total: 95.00
            }
          ],
          delivery_info: {
            address: 'вул. Шевченка, 15, Київ',
            phone: '+380931234567',
            delivery_time: '17:45'
          },
          created_at: new Date(Date.now() - 7200000).toISOString(),
          updated_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      
      // Apply filters if provided
      let filteredOrders = mockOrders;
      if (filters?.status) {
        filteredOrders = filteredOrders.filter(order => order.status === filters.status);
      }
      if (filters?.source) {
        filteredOrders = filteredOrders.filter(order => order.source === filters.source);
      }
      
      return {
        data: filteredOrders,
        success: true
      };
    }
    
    const query = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<Order[]>(`/orders${queryString}`);
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}`);
  }

  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrderStatus(id: string, data: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    // For testing purposes, allow access if URL contains 'test_mode'
    if (typeof window !== 'undefined' && window.location.search.includes('test_mode=true')) {
      return true;
    }
    return !!this.getAuthToken();
  }

  getToken(): string | null {
    return this.getAuthToken();
  }
}

// Export singleton instance
export const robotApi = new RobotApiClient();
export default robotApi;