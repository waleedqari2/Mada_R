import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { RequestItem } from '@/shared/types';

export default function RequestForm() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const departments = [
    'قسم الحجوزات',
    'قسم المبيعات',
    'قسم المشتريات',
    'الإدارة',
    'قسم الحسابات',
  ];

  const [formData, setFormData] = useState({
    paymentType: '',
    requesterName: '',
    jobTitle: '',
    department: '',
    approverDepartment: '',
    notes: '',
  });

  const [items, setItems] = useState<RequestItem[]>([
    {
      description: '',
      unit: 'مصروفات',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ]);

  if (!isAuthenticated) {
    setLocation('/login');
    return null;
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        unit: 'مصروفات',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast.error('يجب أن يكون هناك بند واحد على الأقل');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof RequestItem, value: any) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Calculate total
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }

    setItems(newItems);
  };

  const calculateTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalAmount = calculateTotalAmount();

      if (totalAmount <= 0) {
        toast.error('المبلغ الإجمالي يجب أن يكون أكبر من صفر');
        setLoading(false);
        return;
      }

      const requestData = {
        ...formData,
        amountInNumbers: totalAmount,
        items: items.map((item) => ({
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          notes: item.notes || '',
        })),
      };

      await api.post('/requests', requestData);
      toast.success('تم إنشاء الطلب بنجاح');
      setLocation('/requests');
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => setLocation('/requests')} variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">طلب صرف جديد</h1>
              <p className="text-sm text-muted-foreground">إنشاء طلب صرف مالي جديد</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>معلومات الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentType">نوع الدفع *</Label>
                  <Input
                    id="paymentType"
                    value={formData.paymentType}
                    onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                    required
                    placeholder="مثال: مصروفات تشغيلية"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requesterName">اسم مقدم الطلب *</Label>
                  <Input
                    id="requesterName"
                    value={formData.requesterName}
                    onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                    required
                    placeholder="أدخل الاسم"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">المسمى الوظيفي</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="مثال: مدير مبيعات"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">القسم *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="approverDepartment">قسم المعتمد</Label>
                  <Select
                    value={formData.approverDepartment}
                    onValueChange={(value) =>
                      setFormData({ ...formData, approverDepartment: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر قسم المعتمد" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أدخل أي ملاحظات إضافية"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>بنود الصرف</CardTitle>
              <Button type="button" onClick={handleAddItem} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة بند
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">البند {index + 1}</h4>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label>البيان *</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            required
                            placeholder="وصف البند"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>الوحدة</Label>
                          <Input
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            placeholder="مصروفات"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>الكمية *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>سعر الوحدة *</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>الإجمالي</Label>
                          <Input
                            type="number"
                            value={item.total}
                            readOnly
                            className="bg-muted font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Total */}
              <div className="flex justify-end">
                <Card className="w-full md:w-1/3 bg-primary text-primary-foreground">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">المجموع الكلي:</span>
                      <span className="text-2xl font-bold font-numbers">
                        {calculateTotalAmount().toLocaleString('ar-SA')} ريال
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setLocation('/requests')}>
              إلغاء
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'جاري الحفظ...' : 'حفظ الطلب'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
