import type {
  AdminUser,
  Category,
  Item, 
  Location,
  TelegramUser,
  TelegramLoginResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ReorderCategoriesRequest,
  CreateItemRequest,
  UpdateItemRequest,
  UpdateLocationRequest,
  UpdateDeliverySettingsRequest,
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        data: data.data || data,
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

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  getToken(): string | null {
    return this.getAuthToken();
  }
}

// Export singleton instance
export const robotApi = new RobotApiClient();
export default robotApi;