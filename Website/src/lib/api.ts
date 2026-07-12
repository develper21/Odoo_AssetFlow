/**
 * API Client - AssetFlow Frontend
 * 
 * Centralized API client for communicating with the backend.
 * Handles authentication, request formatting, and error handling.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data?: {
    [key: string]: any;
    total: number;
    page: number;
    limit: number;
  };
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('assetflow_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('assetflow_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('assetflow_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      console.log('API Response:', endpoint, data);
      return data.data as T;
    } catch (error) {
      console.error('API request failed:', endpoint, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const api = new ApiClient(API_BASE);

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get<any>('/dashboard/stats'),
};

// Assets API
export const assetsApi = {
  getAll: (params?: any) => api.get<any>(`/assets?${new URLSearchParams(params).toString()}`),
  getById: (id: string) => api.get<any>(`/assets/${id}`),
  create: (data: any) => api.post<any>('/assets', data),
  update: (id: string, data: any) => api.put<any>(`/assets/${id}`, data),
  delete: (id: string) => api.delete<any>(`/assets/${id}`),
  getSummary: () => api.get<any>('/assets/summary'),
};

// Categories API
export const categoriesApi = {
  getAll: (params?: any) => api.get<any>(`/asset-categories?${new URLSearchParams(params).toString()}`),
  getById: (id: string) => api.get<any>(`/asset-categories/${id}`),
  create: (data: any) => api.post<any>('/asset-categories', data),
  update: (id: string, data: any) => api.put<any>(`/asset-categories/${id}`, data),
};

// Departments API
export const departmentsApi = {
  getAll: (params?: any) => api.get<any>(`/departments?${new URLSearchParams(params).toString()}`),
  getById: (id: string) => api.get<any>(`/departments/${id}`),
  create: (data: any) => api.post<any>('/departments', data),
  update: (id: string, data: any) => api.put<any>(`/departments/${id}`, data),
};

// Employees API
export const employeesApi = {
  getAll: (params?: any) => api.get<any>(`/employees?${new URLSearchParams(params).toString()}`),
  getById: (id: string) => api.get<any>(`/employees/${id}`),
  create: (data: any) => api.post<any>('/auth/signup', data),
  update: (id: string, data: any) => api.put<any>(`/employees/${id}`, data),
  promote: (id: string, role: string) => api.patch<any>(`/employees/${id}/promote`, { role }),
};

// Allocations API
export const allocationsApi = {
  getAll: (params?: any) => api.get<any>(`/allocations?${new URLSearchParams(params).toString()}`),
  checkout: (data: any) => api.post<any>('/allocations/checkout', data),
  checkin: (id: string, data: any) => api.post<any>(`/allocations/check-in/${id}`, data),
  getOverdue: (params?: any) => api.get<any>(`/allocations/overdue?${new URLSearchParams(params).toString()}`),
};

// Bookings API
export const bookingsApi = {
  getAll: (params?: any) => api.get<any>(`/bookings?${new URLSearchParams(params).toString()}`),
  create: (data: any) => api.post<any>('/bookings', data),
  cancel: (id: string) => api.post<any>(`/bookings/${id}/cancel`),
  reschedule: (id: string, data: any) => api.put<any>(`/bookings/${id}/reschedule`, data),
  getResourceHistory: (resourceId: string) => api.get<any>(`/bookings/resource/${resourceId}`),
};

// Maintenance API
export const maintenanceApi = {
  getAll: (params?: any) => api.get<any>(`/maintenance?${new URLSearchParams(params).toString()}`),
  create: (data: any) => api.post<any>('/maintenance', data),
  updateStatus: (id: string, status: string, data?: any) => api.patch<any>(`/maintenance/${id}/status`, { status, ...data }),
  getAssetHistory: (assetId: string) => api.get<any>(`/maintenance/asset/${assetId}`),
};

// Audits API
export const auditsApi = {
  getAll: (params?: any) => api.get<any>(`/audits?${new URLSearchParams(params).toString()}`),
  getById: (id: string) => api.get<any>(`/audits/${id}`),
  create: (data: any) => api.post<any>('/audits', data),
  start: (id: string) => api.post<any>(`/audits/${id}/start`),
  verifyAsset: (id: string, assetId: string, data: any) => api.post<any>(`/audits/${id}/verify/${assetId}`, data),
  close: (id: string) => api.post<any>(`/audits/${id}/close`),
  getDiscrepancies: (id: string) => api.get<any>(`/audits/${id}/discrepancies`),
};

// Notifications API
export const notificationsApi = {
  getAll: (params?: any) => api.get<any>(`/notifications?${new URLSearchParams(params).toString()}`),
  markRead: (id: string) => api.patch<any>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<any>('/notifications/read-all'),
};

// Reports API
export const reportsApi = {
  getUtilization: (params?: any) => api.get<any>(`/reports/utilization?${new URLSearchParams(params).toString()}`),
  getUsageComparison: (params?: any) => api.get<any>(`/reports/usage-comparison?${new URLSearchParams(params).toString()}`),
  getMaintenanceFrequency: (params?: any) => api.get<any>(`/reports/maintenance-frequency?${new URLSearchParams(params).toString()}`),
  getRetirementForecast: (params?: any) => api.get<any>(`/reports/retirement-forecast?${new URLSearchParams(params).toString()}`),
  getDepartmentSummary: (params?: any) => api.get<any>(`/reports/departments-summary?${new URLSearchParams(params).toString()}`),
  getBookingHeatmap: (params?: any) => api.get<any>(`/reports/bookings-heatmap?${new URLSearchParams(params).toString()}`),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) => api.post<any>('/auth/login', { email, password }),
  register: (data: any) => api.post<any>('/auth/signup', data),
  logout: () => api.post<any>('/auth/logout'),
  getMe: () => api.get<any>('/auth/me'),
  forgotPassword: (email: string) => api.post<any>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.put<any>(`/auth/reset-password/${token}`, { password }),
};

export default api;
