export type ID = string;

export interface Task {
  id: ID;
  title: string;
  description?: string;
  status: 'new' | 'in_progress' | 'done' | 'failed';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateTaskInput {
  title: string;
  description?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: Task['status'];
}

export interface TaskListParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface TaskListResponse {
  items: Task[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}