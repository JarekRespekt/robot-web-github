import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions 
} from '@tanstack/react-query';
import { 
  Task, 
  TaskListResponse, 
  TaskListParams,
  CreateTaskInput,
  UpdateTaskInput,
  ApiError 
} from '@/types/task';
import { get, post, put, del, buildQueryString } from '@/lib/api';

// Query Keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params: TaskListParams) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

// Hooks for Tasks
export function useTasks(
  params: TaskListParams = {},
  options?: UseQueryOptions<TaskListResponse, ApiError>
) {
  const queryString = buildQueryString(params);
  
  return useQuery<TaskListResponse, ApiError>({
    queryKey: taskKeys.list(params),
    queryFn: () => get<TaskListResponse>(`/api/tasks${queryString}`),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

export function useTask(
  id: string,
  options?: UseQueryOptions<Task, ApiError>
) {
  return useQuery<Task, ApiError>({
    queryKey: taskKeys.detail(id),
    queryFn: () => get<Task>(`/api/tasks/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

export function useCreateTask(
  options?: UseMutationOptions<Task, ApiError, CreateTaskInput>
) {
  const queryClient = useQueryClient();
  
  return useMutation<Task, ApiError, CreateTaskInput>({
    mutationFn: (input) => post<Task>('/api/tasks', input),
    onSuccess: () => {
      // Invalidate and refetch task lists
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    ...options,
  });
}

export function useUpdateTask(
  options?: UseMutationOptions<Task, ApiError, { id: string; input: UpdateTaskInput }>
) {
  const queryClient = useQueryClient();
  
  return useMutation<Task, ApiError, { id: string; input: UpdateTaskInput }>({
    mutationFn: ({ id, input }) => put<Task>(`/api/tasks/${id}`, input),
    onSuccess: (data) => {
      // Update the specific task in cache
      queryClient.setQueryData(taskKeys.detail(data.id), data);
      
      // Invalidate task lists to reflect changes
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    ...options,
  });
}

export function useDeleteTask(
  options?: UseMutationOptions<{ ok: boolean }, ApiError, string>
) {
  const queryClient = useQueryClient();
  
  return useMutation<{ ok: boolean }, ApiError, string>({
    mutationFn: (id) => del<{ ok: boolean }>(`/api/tasks/${id}`),
    onSuccess: (_, id) => {
      // Remove the specific task from cache
      queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
      
      // Invalidate task lists
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
    ...options,
  });
}