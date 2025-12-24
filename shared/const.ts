export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

// Request Management Types
export type PaymentType = 'نقدي' | 'شيك' | 'تحويل';
export type DepartmentType = 'الإدارة' | 'الحسابات' | 'المبيعات' | 'التسويق' | 'الحجوزات' | 'العمليات';
export type RequestStatus = 'تم التعميد' | 'في انتظار التعميد' | 'موافق عليها' | 'تم التنفيذ';

export interface Request {
  id: number;
  requestNumber: string;
  paymentType: PaymentType;
  requesterName: string;
  jobTitle: string;
  department: DepartmentType;
  approverDepartment: DepartmentType;
  amountInNumbers: number;
  amountInWords: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export const PAYMENT_TYPES: PaymentType[] = ['نقدي', 'شيك', 'تحويل'];
export const DEPARTMENTS: DepartmentType[] = ['الإدارة', 'الحسابات', 'المبيعات', 'التسويق', 'الحجوزات', 'العمليات'];
export const REQUEST_STATUSES: RequestStatus[] = ['تم التعميد', 'في انتظار التعميد', 'موافق عليها', 'تم التنفيذ'];
