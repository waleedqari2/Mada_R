// API Types
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  phone?: string;
  created_at?: string;
  last_login?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Request {
  id: number;
  request_number: string;
  user_id: number;
  department: string;
  beneficiary: string;
  request_date: string;
  description?: string;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approved_by?: number;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  creator_username?: string;
  creator_name?: string;
  approver_username?: string;
  approver_name?: string;
}

export interface RequestItem {
  id: number;
  request_id: number;
  item_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
}

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  old_value?: string;
  new_value?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  username?: string;
  full_name?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  related_entity_type?: string;
  related_entity_id?: number;
  created_at: string;
  read_at?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationData;
}

export interface ReportSummary {
  statusStats: Array<{
    status: string;
    count: number;
    total_amount: number;
  }>;
  totalStats: {
    total_requests: number;
    total_amount: number;
    avg_amount: number;
    max_amount: number;
    min_amount: number;
  };
  departmentStats: Array<{
    department: string;
    count: number;
    total_amount: number;
  }>;
  recentActivity: Array<{
    date: string;
    count: number;
    total_amount: number;
  }>;
}
