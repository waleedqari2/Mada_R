import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data: any = error.response.data;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('جلستك انتهت، يرجى تسجيل الدخول مرة أخرى');
      } else if (status === 403) {
        toast.error('ليس لديك صلاحية للوصول إلى هذا المورد');
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        toast.error('حدث خطأ في الخادم');
      }
    } else if (error.request) {
      toast.error('لا يمكن الاتصال بالخادم');
    } else {
      toast.error('حدث خطأ غير متوقع');
    }

    return Promise.reject(error);
  }
);

export default api;
