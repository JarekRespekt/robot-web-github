import { ApiError } from '@/types/task';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
}

interface RequestConfig extends RequestInit {
  timeout?: number;
}

async function request<T>(
  path: string, 
  options: RequestConfig = {}
): Promise<T> {
  const { timeout = 10000, ...requestOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  
  const config: RequestInit = {
    ...requestOptions,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...requestOptions.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Handle non-JSON responses (like 204 No Content)
    const contentType = response.headers.get('content-type');
    let data: any = null;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new ApiError(response.status, errorMessage, data);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }
    
    throw new ApiError(0, 'Network error', error);
  }
}

export async function get<T>(path: string, options?: RequestConfig): Promise<T> {
  return request<T>(path, { method: 'GET', ...options });
}

export async function post<T>(
  path: string, 
  body: unknown, 
  options?: RequestConfig
): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  });
}

export async function put<T>(
  path: string, 
  body: unknown, 
  options?: RequestConfig
): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
    ...options,
  });
}

export async function del<T>(path: string, options?: RequestConfig): Promise<T> {
  return request<T>(path, { method: 'DELETE', ...options });
}

// Utility function to build query strings
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}