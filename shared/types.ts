// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'accountant' | 'user';
  createdAt: string;
}

// Request types
export interface RequestItem {
  id?: number;
  requestId?: number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface Request {
  id: number;
  requestNumber: string;
  paymentType: string;
  requesterName: string;
  jobTitle?: string;
  department: string;
  approverDepartment?: string;
  amountInNumbers: number;
  amountInWords: string;
  notes?: string;
  status: 'تم التعميد' | 'في انتظار' | 'موافق' | 'تم التنفيذ';
  approverSignature?: string;
  managerSignature?: string;
  accountantSignature?: string;
  approvalDate?: string;
  implementationDate?: string;
  createdBy: number;
  createdAt: string;
  updatedBy?: number;
  updatedAt?: string;
  createdByUsername?: string;
  items?: RequestItem[];
}

// Audit log types
export interface AuditLog {
  id: number;
  userId: number;
  username?: string;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'signature_add';
  requestId?: number;
  requestNumber?: string;
  changes?: string;
  timestamp: string;
}

// Notification types
export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: 'approval' | 'delay' | 'status_change' | 'general';
  isRead: boolean;
  requestId?: number;
  requestNumber?: string;
  createdAt: string;
}

// Report types
export interface SummaryReport {
  totalRequests: number;
  totalAmount: number;
  completedRequests: number;
  pendingRequests: number;
  approvedRequests: number;
}

export interface MonthlyReport {
  date: string;
  count: number;
  totalAmount: number;
  status: string;
}

export interface DepartmentReport {
  department: string;
  requestCount: number;
  totalAmount: number;
  avgAmount: number;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  role?: 'admin' | 'manager' | 'accountant' | 'user';
}

export interface AuthResponse {
  token: string;
  user: User;
}
