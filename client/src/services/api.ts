import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic request handler
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await apiClient.request<T>(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'حدث خطأ في الخادم');
    }
    throw new Error('حدث خطأ في الاتصال بالخادم');
  }
}

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    return request<any>({
      method: 'POST',
      url: '/auth/login',
      data: { username, password },
    });
  },

  register: async (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    department?: string;
    phone?: string;
  }) => {
    return request<any>({
      method: 'POST',
      url: '/auth/register',
      data,
    });
  },

  logout: async () => {
    return request<any>({
      method: 'POST',
      url: '/auth/logout',
    });
  },

  getProfile: async () => {
    return request<any>({
      method: 'GET',
      url: '/auth/profile',
    });
  },

  updateProfile: async (data: {
    full_name?: string;
    email?: string;
    department?: string;
    phone?: string;
  }) => {
    return request<any>({
      method: 'PUT',
      url: '/auth/profile',
      data,
    });
  },
};

// Requests API
export const requestsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    department?: string;
    userId?: string;
  }) => {
    return request<any>({
      method: 'GET',
      url: '/requests',
      params,
    });
  },

  getById: async (id: number) => {
    return request<any>({
      method: 'GET',
      url: `/requests/${id}`,
    });
  },

  create: async (data: any) => {
    return request<any>({
      method: 'POST',
      url: '/requests',
      data,
    });
  },

  update: async (id: number, data: any) => {
    return request<any>({
      method: 'PUT',
      url: `/requests/${id}`,
      data,
    });
  },

  delete: async (id: number) => {
    return request<any>({
      method: 'DELETE',
      url: `/requests/${id}`,
    });
  },

  updateStatus: async (id: number, status: string, notes?: string) => {
    return request<any>({
      method: 'PATCH',
      url: `/requests/${id}/status`,
      data: { status, notes },
    });
  },

  search: async (query: string, params?: { page?: number; limit?: number }) => {
    return request<any>({
      method: 'GET',
      url: '/requests/search',
      params: { query, ...params },
    });
  },

  filter: async (filters: {
    status?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
  }) => {
    return request<any>({
      method: 'GET',
      url: '/requests/filter',
      params: filters,
    });
  },
};

// Reports API
export const reportsApi = {
  getSummary: async () => {
    return request<any>({
      method: 'GET',
      url: '/reports/summary',
    });
  },

  getMonthly: async (year?: number, month?: number) => {
    return request<any>({
      method: 'GET',
      url: '/reports/monthly',
      params: { year, month },
    });
  },

  getByDepartment: async (params?: {
    department?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return request<any>({
      method: 'GET',
      url: '/reports/by-department',
      params,
    });
  },

  exportExcel: async (params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    department?: string;
  }) => {
    const response = await apiClient.get('/reports/export/excel', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  exportCSV: async (params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    department?: string;
  }) => {
    const response = await apiClient.get('/reports/export/csv', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

// Audit Logs API
export const auditLogsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    userId?: number;
    entityType?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return request<any>({
      method: 'GET',
      url: '/audit-logs',
      params,
    });
  },
};

// Notifications API
export const notificationsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) => {
    return request<any>({
      method: 'GET',
      url: '/notifications',
      params,
    });
  },

  markAsRead: async (id: number) => {
    return request<any>({
      method: 'PATCH',
      url: `/notifications/${id}/read`,
    });
  },

  markAllAsRead: async () => {
    return request<any>({
      method: 'PATCH',
      url: '/notifications/read-all',
    });
  },

  delete: async (id: number) => {
    return request<any>({
      method: 'DELETE',
      url: `/notifications/${id}`,
    });
  },
};

export default apiClient;
