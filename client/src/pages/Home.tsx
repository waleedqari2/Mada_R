/**
 * Design Philosophy: Swiss Design with Modern Arabic Touch
 * - Clean hierarchy with professional blue (#1e3a5f) and gold accents (#d4af37)
 * - Cairo font for headings, Tajawal for numbers
 * - Elevated cards with subtle shadows
 * - Smooth interactions and elegant animations
 * - Editable items with approval workflow
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  FileText, 
  Calendar, 
  Building2, 
  Hash, 
  TrendingUp, 
  DollarSign, 
  Edit2, 
  Save, 
  X, 
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  UserCheck
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { generateExpensePDF } from "@/lib/pdfExporter";

interface ExpenseItem {
  id: number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes: string;
}

interface ApprovalStatus {
  role: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  date?: string;
}

export default function Home() {
  const departments = [
    "قسم الحجوزات",
    "قسم المبيعات",
    "قسم المشتريات",
    "الإدارة",
    "قسم الحسابات",
  ];

  const [expenseData, setExpenseData] = useState({
    requestTo: "الإدارة المالية",
    requestNumber: "MADA-000",
    date: "2025-12-22",
    department: "الإدارة",
    deliveryDate: "2025-12-22",
    items: Array.from({ length: 19 }, (_, i) => ({
      id: i + 1,
      description: "تصديق خطاب شركة مدى السياحية من الغرفة التجارية",
      unit: "مصروفات",
      quantity: 1,
      unitPrice: 35,
      total: 35,
      notes: "",
    })) as ExpenseItem[],
  });

  const [approvals, setApprovals] = useState<ApprovalStatus[]>([
    { role: "المدير المالي", name: "أحمد داود", status: "pending" },
    { role: "المدير التنفيذي", name: "سيف جعفر", status: "pending" },
    { role: "المدير العام", name: "عبد العزيز قاري", status: "pending" },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ExpenseItem | null>(null);

  const totalAmount = expenseData.items.reduce((sum, item) => sum + item.total, 0);
  const itemCount = expenseData.items.length;
  const avgItemCost = totalAmount / itemCount;

  const handleDownload = () => {
    window.open('/طلب_صرف_محسّن.xlsx', '_blank');
    toast.success("تم بدء تحميل الملف");
  };

  const handleExportPDF = async () => {
    try {
      await generateExpensePDF({
        requestNumber: expenseData.requestNumber,
        date: expenseData.date,
        department: expenseData.department,
        deliveryDate: expenseData.deliveryDate,
        items: expenseData.items,
        totalAmount,
        approvals,
      });
      toast.success("تم تصدير PDF بنجاح");
    } catch (error) {
      toast.error("حدث خطأ في تصدير PDF");
      console.error(error);
    }
  };

  const handleEdit = (item: ExpenseItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
  };

  const handleSave = () => {
    if (!editForm) return;
    
    const updatedItems = expenseData.items.map(item => 
      item.id === editingId 
        ? { ...editForm, total: editForm.quantity * editForm.unitPrice }
        : item
    );
    
    setExpenseData({ ...expenseData, items: updatedItems });
    setEditingId(null);
    setEditForm(null);
    toast.success("تم حفظ التعديلات بنجاح");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: number) => {
    const updatedItems = expenseData.items.filter(item => item.id !== id);
    setExpenseData({ ...expenseData, items: updatedItems });
    toast.success("تم حذف البند بنجاح");
  };

  const handleAddItem = () => {
    const newId = Math.max(...expenseData.items.map(i => i.id), 0) + 1;
    const newItem: ExpenseItem = {
      id: newId,
      description: "بند جديد",
      unit: "مصروفات",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      notes: "",
    };
    setExpenseData({ ...expenseData, items: [...expenseData.items, newItem] });
    toast.success("تم إضافة بند جديد");
  };

  const getApprovalIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getApprovalBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getApprovalText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'تمت الموافقة';
      case 'rejected':
        return 'مرفوض';
      default:
        return 'في انتظار الموافقة';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/images/logo.jpg" alt="Mada Tourism" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">عارض طلبات الصرف</h1>
                <p className="text-sm text-muted-foreground">نظام إدارة المصروفات لشركة مدى السياحية</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleExportPDF} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <FileText className="w-4 h-4" />
                تصدير PDF
              </Button>
              <Button onClick={handleDownload} className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                <Download className="w-4 h-4" />
                تحميل Excel
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {/* Approval Status - Compact Button Style */}
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-amber-600" />
            حالة الموافقات:
          </span>
          {approvals.map((approval, index) => (
            <Button
              key={index}
              variant="outline"
              className="gap-2 px-3 py-2 h-auto text-sm"
              disabled
            >
              {getApprovalIcon(approval.status)}
              <span className="font-medium">{approval.role}</span>
              <span className="text-xs text-muted-foreground">({approval.name})</span>
            </Button>
          ))}
        </div>

        {/* Request Information Card */}
        <Card className="shadow-lg border-border/50 animate-fade-in">
          <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b border-border/50">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              معلومات الطلب
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Building2 className="w-4 h-4" />
                  <span>طلب مقدم إلى</span>
                </div>
                <p className="text-lg font-semibold text-foreground">{expenseData.requestTo}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Hash className="w-4 h-4" />
                  <span>رقم الطلب</span>
                </div>
                <Badge variant="outline" className="text-base font-numbers font-semibold px-3 py-1 border-accent text-accent">
                  {expenseData.requestNumber}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>التاريخ</span>
                </div>
                <p className="text-lg font-semibold font-numbers text-foreground">{expenseData.date}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Building2 className="w-4 h-4" />
                  <span>القسم</span>
                </div>
                <Select value={expenseData.department} onValueChange={(value) => setExpenseData({ ...expenseData, department: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
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
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>تاريخ التنفيذ</span>
                </div>
                <p className="text-lg font-semibold font-numbers text-foreground">{expenseData.deliveryDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md border-border/50 hover:shadow-lg transition-shadow animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">المجموع الكلي</p>
                  <p className="text-3xl font-bold font-numbers text-accent">{totalAmount.toLocaleString('ar-SA')}</p>
                  <p className="text-xs text-muted-foreground mt-1">ريال سعودي</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-border/50 hover:shadow-lg transition-shadow animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">عدد البنود</p>
                  <p className="text-3xl font-bold font-numbers text-primary">{itemCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">بند</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-border/50 hover:shadow-lg transition-shadow animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">متوسط التكلفة</p>
                  <p className="text-3xl font-bold font-numbers text-foreground">{avgItemCost.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">ريال للبند</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Items Table */}
        <Card className="shadow-lg border-border/50 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <CardHeader className="bg-gradient-to-l from-primary/5 to-transparent border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">تفاصيل المصروفات</CardTitle>
              <Button onClick={handleAddItem} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة بند
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-center font-bold">#</TableHead>
                    <TableHead className="text-right font-bold min-w-[300px]">البيان</TableHead>
                    <TableHead className="text-center font-bold">الوحدة</TableHead>
                    <TableHead className="text-center font-bold">الكمية</TableHead>
                    <TableHead className="text-center font-bold">سعر الوحدة</TableHead>
                    <TableHead className="text-center font-bold">الإجمالي</TableHead>
                    <TableHead className="text-center font-bold">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseData.items.map((item, index) => (
                    <TableRow 
                      key={item.id} 
                      className={`
                        transition-colors
                        ${editingId === item.id ? 'bg-accent/10' : index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                        ${editingId !== item.id && 'hover:bg-accent/5'}
                      `}
                    >
                      <TableCell className="text-center font-numbers font-semibold text-muted-foreground">
                        {item.id}
                      </TableCell>
                      
                      {editingId === item.id ? (
                        <>
                          <TableCell>
                            <Input
                              value={editForm?.description || ''}
                              onChange={(e) => setEditForm({ ...editForm!, description: e.target.value })}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={editForm?.unit || ''}
                              onChange={(e) => setEditForm({ ...editForm!, unit: e.target.value })}
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={editForm?.quantity || 0}
                              onChange={(e) => setEditForm({ ...editForm!, quantity: Number(e.target.value) })}
                              className="w-20 text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={editForm?.unitPrice || 0}
                              onChange={(e) => setEditForm({ ...editForm!, unitPrice: Number(e.target.value) })}
                              className="w-24 text-center"
                            />
                          </TableCell>
                          <TableCell className="text-center font-numbers font-bold text-accent">
                            {((editForm?.quantity || 0) * (editForm?.unitPrice || 0)).toLocaleString('ar-SA')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button onClick={handleSave} size="sm" variant="default" className="gap-1">
                                <Save className="w-3 h-3" />
                                حفظ
                              </Button>
                              <Button onClick={handleCancel} size="sm" variant="outline" className="gap-1">
                                <X className="w-3 h-3" />
                                إلغاء
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="text-right">{item.description}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="font-medium">
                              {item.unit}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-numbers">{item.quantity}</TableCell>
                          <TableCell className="text-center font-numbers font-semibold">
                            {item.unitPrice.toLocaleString('ar-SA')}
                          </TableCell>
                          <TableCell className="text-center font-numbers font-bold text-accent">
                            {item.total.toLocaleString('ar-SA')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                onClick={() => handleEdit(item)} 
                                size="sm" 
                                variant="outline"
                                className="gap-1"
                              >
                                <Edit2 className="w-3 h-3" />
                                تعديل
                              </Button>
                              <Button 
                                onClick={() => handleDelete(item.id)} 
                                size="sm" 
                                variant="destructive"
                                className="gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                حذف
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                  
                  {/* Total Row */}
                  <TableRow className="bg-primary text-primary-foreground hover:bg-primary">
                    <TableCell colSpan={5} className="text-center font-bold text-lg">
                      المجموع الكلي
                    </TableCell>
                    <TableCell className="text-center font-numbers font-bold text-xl">
                      {totalAmount.toLocaleString('ar-SA')} ريال
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <Card className="shadow-md border-border/50 bg-accent/5 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              تم إنشاء هذا التقرير تلقائياً من نظام إدارة المصروفات • جميع الأرقام بالريال السعودي
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
