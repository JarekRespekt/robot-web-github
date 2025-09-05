import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query';
import robotApi from './robot-api';
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
} from '@/types/robot';

// Query Keys
export const robotQueryKeys = {
  // Auth
  me: ['robot', 'me'] as const,
  
  // Categories
  categories: ['robot', 'categories'] as const,
  category: (id: string) => ['robot', 'categories', id] as const,
  
  // Items
  items: (categoryId?: string) => 
    categoryId 
      ? ['robot', 'items', { categoryId }] as const
      : ['robot', 'items'] as const,
  item: (id: string) => ['robot', 'items', id] as const,
  
  // Locations
  locations: ['robot', 'locations'] as const,
  
  // Media
  cloudinarySign: ['robot', 'media', 'sign'] as const,
  
  // Orders
  orders: (filters?: OrdersFilters) => 
    filters 
      ? ['robot', 'orders', filters] as const
      : ['robot', 'orders'] as const,
  order: (id: string) => ['robot', 'orders', id] as const,
};

// Auth Hooks
export function useMe(options?: UseQueryOptions<AdminUser, Error>) {
  return useQuery({
    queryKey: robotQueryKeys.me,
    queryFn: async () => {
      const response = await robotApi.getMe();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to get user info');
      }
      return response.data;
    },
    enabled: robotApi.isAuthenticated(),
    retry: false,
    ...options,
  });
}

export function useTelegramLogin(
  options?: UseMutationOptions<TelegramLoginResponse, Error, TelegramUser>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (telegramData: TelegramUser) => {
      const response = await robotApi.verifyTelegramLogin(telegramData);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Login failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Set user data in cache
      queryClient.setQueryData(robotQueryKeys.me, data.user);
    },
    ...options,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => robotApi.logout(),
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
}

// Category Hooks
export function useCategories(options?: UseQueryOptions<Category[], Error>) {
  return useQuery({
    queryKey: robotQueryKeys.categories,
    queryFn: async () => {
      const response = await robotApi.getCategories();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch categories');
      }
      return response.data;
    },
    ...options,
  });
}

export function useCategory(id: string, options?: UseQueryOptions<Category, Error>) {
  return useQuery({
    queryKey: robotQueryKeys.category(id),
    queryFn: async () => {
      const response = await robotApi.getCategory(id);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch category');
      }
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useCreateCategory(
  options?: UseMutationOptions<Category, Error, CreateCategoryRequest>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCategoryRequest) => {
      const response = await robotApi.createCategory(data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create category');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: robotQueryKeys.categories });
    },
    ...options,
  });
}

export function useUpdateCategory(
  options?: UseMutationOptions<Category, Error, { id: string; data: UpdateCategoryRequest }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryRequest }) => {
      const response = await robotApi.updateCategory(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update category');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(robotQueryKeys.category(data.id), data);
      queryClient.invalidateQueries({ queryKey: robotQueryKeys.categories });
    },
    ...options,
  });
}

export function useDeleteCategory(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await robotApi.deleteCategory(id);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete category');
      }
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: robotQueryKeys.category(id) });
      queryClient.invalidateQueries({ queryKey: robotQueryKeys.categories });
      queryClient.invalidateQueries({ queryKey: ['robot', 'items'] });
    },
    ...options,
  });
}

export function useReorderCategories(
  options?: UseMutationOptions<Category[], Error, ReorderCategoriesRequest>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ReorderCategoriesRequest) => {
      const response = await robotApi.reorderCategories(data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to reorder categories');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(robotQueryKeys.categories, data);
    },
    ...options,
  });
}

// Item Hooks
export function useItems(categoryId?: string, options?: UseQueryOptions<Item[], Error>) {
  return useQuery({
    queryKey: robotQueryKeys.items(categoryId),
    queryFn: async () => {
      const response = await robotApi.getItems(categoryId);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch items');
      }
      return response.data;
    },
    ...options,
  });
}

export function useItem(id: string, options?: UseQueryOptions<Item, Error>) {
  return useQuery({
    queryKey: robotQueryKeys.item(id),
    queryFn: async () => {
      const response = await robotApi.getItem(id);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch item');
      }
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
}

export function useCreateItem(
  options?: UseMutationOptions<Item, Error, CreateItemRequest>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateItemRequest) => {
      const response = await robotApi.createItem(data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create item');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['robot', 'items'] });
      queryClient.setQueryData(robotQueryKeys.item(data.id), data);
    },
    ...options,
  });
}

export function useUpdateItem(
  options?: UseMutationOptions<Item, Error, { id: string; data: UpdateItemRequest }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateItemRequest }) => {
      const response = await robotApi.updateItem(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update item');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(robotQueryKeys.item(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['robot', 'items'] });
    },
    ...options,
  });
}

export function useDeleteItem(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await robotApi.deleteItem(id);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete item');
      }
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: robotQueryKeys.item(id) });
      queryClient.invalidateQueries({ queryKey: ['robot', 'items'] });
    },
    ...options,
  });
}

export function useUpdateItemAvailability(
  options?: UseMutationOptions<Item, Error, { id: string; available: boolean }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, available }: { id: string; available: boolean }) => {
      const response = await robotApi.updateItemAvailability(id, available);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update availability');
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(robotQueryKeys.item(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['robot', 'items'] });
    },
    ...options,
  });
}

// Location Hooks
export function useLocations(options?: UseQueryOptions<Location[], Error>) {
  return useQuery({
    queryKey: robotQueryKeys.locations,
    queryFn: async () => {
      const response = await robotApi.getLocations();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch locations');
      }
      return response.data;
    },
    ...options,
  });
}

export function useUpdateLocation(
  options?: UseMutationOptions<Location, Error, { id: string; data: UpdateLocationRequest }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLocationRequest }) => {
      const response = await robotApi.updateLocation(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update location');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: robotQueryKeys.locations });
    },
    ...options,
  });
}

export function useUpdateDeliverySettings(
  options?: UseMutationOptions<Location, Error, { id: string; data: UpdateDeliverySettingsRequest }>
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDeliverySettingsRequest }) => {
      const response = await robotApi.updateDeliverySettings(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update delivery settings');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: robotQueryKeys.locations });
    },
    ...options,
  });
}

// Media Hooks
export function useCloudinarySign(options?: UseQueryOptions<CloudinarySignResponse, Error>) {
  return useQuery({
    queryKey: robotQueryKeys.cloudinarySign,
    queryFn: async () => {
      const response = await robotApi.signUpload();
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to get upload signature');
      }
      return response.data;
    },
    enabled: false, // Only fetch when explicitly requested
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}