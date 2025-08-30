// ROBOT Admin Panel Types

export type I18nStr = { 
  ua: string; 
  pl: string; 
  en: string; 
};

export type Locale = 'ua' | 'pl' | 'en';

export interface Category { 
  id: string; 
  tenant_id: string; 
  name: I18nStr; 
  order: number; 
  visible: boolean; 
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string; 
  category_id: string; 
  name: I18nStr; 
  description: I18nStr;
  price: number; 
  packaging_price?: number; 
  available: boolean;
  photo?: { 
    public_id: string; 
    url: string; 
  };
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string; 
  name: string; 
  address: string; 
  phone?: string;
  hours?: Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', {
    open: string;
    close: string;
    closed?: boolean;
  }>;
  socials?: { 
    facebook?: string; 
    instagram?: string; 
    tiktok?: string; 
  };
  delivery_settings: Array<{ 
    method: 'pickup' | 'courier' | 'self'; 
    enabled: boolean; 
    delivery_fee: number; 
  }>;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  tenant_id: string;
  telegram_id: string;
  first_name: string;
  last_name?: string;
  username?: string;
  role: 'admin';
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  name: string;
  currency: string;
  socials?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  contacts?: {
    email?: string;
    phone?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  public_id: string;
  url: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  created_at: string;
}

// Telegram Login Widget Types
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface TelegramLoginResponse {
  token: string;
  user: AdminUser;
  tenant: Tenant;
}

// API Request/Response Types
export interface CreateCategoryRequest {
  name: I18nStr;
  visible?: boolean;
}

export interface UpdateCategoryRequest {
  name?: I18nStr;
  visible?: boolean;
}

export interface ReorderCategoriesRequest {
  categories: Array<{
    id: string;
    order: number;
  }>;
}

export interface CreateItemRequest {
  category_id: string;
  name: I18nStr;
  description: I18nStr;
  price: number;
  packaging_price?: number;
  available?: boolean;
  photo?: {
    public_id: string;
    url: string;
  };
}

export interface UpdateItemRequest {
  category_id?: string;
  name?: I18nStr;
  description?: I18nStr;
  price?: number;
  packaging_price?: number;
  available?: boolean;
  photo?: {
    public_id: string;
    url: string;
  };
}

export interface UpdateLocationRequest {
  name?: string;
  address?: string;
  phone?: string;
  hours?: Location['hours'];
  socials?: Location['socials'];
}

export interface UpdateDeliverySettingsRequest {
  delivery_settings: Location['delivery_settings'];
}

export interface CloudinarySignResponse {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  public_id?: string;
}

// API Error Types
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  success: boolean;
}