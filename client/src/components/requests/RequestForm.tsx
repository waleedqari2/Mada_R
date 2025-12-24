import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PAYMENT_TYPES, DEPARTMENTS, PaymentType, DepartmentType, Request } from "@shared/const";
import { RequestInput } from "@/hooks/api/useRequests";
import { Save, X } from "lucide-react";
import { toast } from "sonner";

interface RequestFormProps {
  request?: Request | null;
  onSubmit: (data: RequestInput) => Promise<void>;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export type { RequestInput } from "@/hooks/api/useRequests";

export default function RequestForm({ request, onSubmit, onCancel, mode = 'create' }: RequestFormProps) {
  const [formData, setFormData] = useState<RequestInput>({
    paymentType: 'نقدي',
    requesterName: '',
    jobTitle: '',
    department: 'الإدارة',
    approverDepartment: 'الإدارة',
    amountInNumbers: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountInWords, setAmountInWords] = useState<string>('');

  useEffect(() => {
    if (request) {
      setFormData({
        paymentType: request.paymentType,
        requesterName: request.requesterName,
        jobTitle: request.jobTitle,
        department: request.department,
        approverDepartment: request.approverDepartment,
        amountInNumbers: request.amountInNumbers,
      });
      setAmountInWords(request.amountInWords);
    }
  }, [request]);

  // Convert amount to Arabic words on client side for preview
  useEffect(() => {
    if (formData.amountInNumbers > 0) {
      // This is a placeholder - the actual conversion happens on the server
      setAmountInWords(`${formData.amountInNumbers} ريال سعودي (سيتم التحويل تلقائياً)`);
    } else {
      setAmountInWords('');
    }
  }, [formData.amountInNumbers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.requesterName.trim()) {
      toast.error('يرجى إدخال اسم مقدم الطلب');
      return;
    }
    if (!formData.jobTitle.trim()) {
      toast.error('يرجى إدخال الوظيفة');
      return;
    }
    if (formData.amountInNumbers <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      
      // Reset form if creating a new request
      if (mode === 'create') {
        setFormData({
          paymentType: 'نقدي',
          requesterName: '',
          jobTitle: '',
          department: 'الإدارة',
          approverDepartment: 'الإدارة',
          amountInNumbers: 0,
        });
        setAmountInWords('');
      }
      
      toast.success(mode === 'create' ? 'تم إنشاء الطلب بنجاح' : 'تم تحديث الطلب بنجاح');
    } catch (error) {
      toast.error((error as Error).message || 'حدث خطأ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {mode === 'create' ? 'طلب صرف جديد' : 'تعديل طلب الصرف'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Type */}
            <div className="space-y-2">
              <Label htmlFor="paymentType">نوع التصرف</Label>
              <Select
                value={formData.paymentType}
                onValueChange={(value) => setFormData({ ...formData, paymentType: value as PaymentType })}
              >
                <SelectTrigger id="paymentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Requester Name */}
            <div className="space-y-2">
              <Label htmlFor="requesterName">اسم مقدم الطلب</Label>
              <Input
                id="requesterName"
                value={formData.requesterName}
                onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                placeholder="أدخل اسم مقدم الطلب"
                required
              />
            </div>

            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="jobTitle">الوظيفة</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="أدخل الوظيفة"
                required
              />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">القسم</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value as DepartmentType })}
              >
                <SelectTrigger id="department">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Approver Department */}
            <div className="space-y-2">
              <Label htmlFor="approverDepartment">إدارة المعتمد</Label>
              <Select
                value={formData.approverDepartment}
                onValueChange={(value) => setFormData({ ...formData, approverDepartment: value as DepartmentType })}
              >
                <SelectTrigger id="approverDepartment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount in Numbers */}
            <div className="space-y-2">
              <Label htmlFor="amountInNumbers">مبلغ الصرف بالأرقام</Label>
              <Input
                id="amountInNumbers"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.amountInNumbers || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, amountInNumbers: value ? parseFloat(value) : 0 });
                }}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Amount in Words - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="amountInWords">مبلغ الصرف كتابتاً</Label>
            <Input
              id="amountInWords"
              value={amountInWords}
              readOnly
              className="bg-muted"
              placeholder="سيتم التحويل تلقائياً"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                <X className="w-4 h-4 ml-2" />
                إلغاء
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 ml-2" />
              {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
