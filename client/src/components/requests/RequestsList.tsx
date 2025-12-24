import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Request, REQUEST_STATUSES, RequestStatus } from "@shared/const";
import { Edit2, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RequestsListProps {
  requests: Request[];
  onEdit: (request: Request) => void;
  onDelete: (id: number) => Promise<void>;
  onUpdateStatus: (id: number, status: RequestStatus) => Promise<void>;
  loading?: boolean;
}

export default function RequestsList({
  requests,
  onEdit,
  onDelete,
  onUpdateStatus,
  loading = false,
}: RequestsListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const getStatusColor = (status: RequestStatus): string => {
    switch (status) {
      case 'تم التعميد':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'في انتظار التعميد':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'موافق عليها':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'تم التنفيذ':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await onDelete(id);
      toast.success('تم حذف الطلب بنجاح');
      setDeletingId(null);
    } catch (error) {
      toast.error((error as Error).message || 'حدث خطأ في حذف الطلب');
    }
  };

  const handleStatusChange = async (id: number, newStatus: RequestStatus) => {
    try {
      setUpdatingStatusId(id);
      await onUpdateStatus(id, newStatus);
      toast.success('تم تحديث حالة الطلب بنجاح');
    } catch (error) {
      toast.error((error as Error).message || 'حدث خطأ في تحديث الحالة');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            <span className="mr-2 text-muted-foreground">جارٍ التحميل...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">قائمة الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            لا توجد طلبات حالياً. قم بإضافة طلب جديد للبدء.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            قائمة الطلبات ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right font-bold">رقم الطلب</TableHead>
                  <TableHead className="text-right font-bold">اسم المقدم</TableHead>
                  <TableHead className="text-right font-bold">الوظيفة</TableHead>
                  <TableHead className="text-right font-bold">القسم</TableHead>
                  <TableHead className="text-right font-bold">نوع التصرف</TableHead>
                  <TableHead className="text-right font-bold">المبلغ</TableHead>
                  <TableHead className="text-center font-bold">الحالة</TableHead>
                  <TableHead className="text-center font-bold">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request, index) => (
                  <TableRow
                    key={request.id}
                    className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                  >
                    <TableCell className="font-medium font-numbers">
                      {request.requestNumber}
                    </TableCell>
                    <TableCell>{request.requesterName}</TableCell>
                    <TableCell>{request.jobTitle}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{request.paymentType}</Badge>
                    </TableCell>
                    <TableCell className="font-numbers font-semibold">
                      {request.amountInNumbers.toLocaleString('ar-SA')} ريال
                    </TableCell>
                    <TableCell className="text-center">
                      <Select
                        value={request.status}
                        onValueChange={(value) => handleStatusChange(request.id, value as RequestStatus)}
                        disabled={updatingStatusId === request.id}
                      >
                        <SelectTrigger
                          className={`w-full ${getStatusColor(request.status)}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REQUEST_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(request)}
                          className="gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          تعديل
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletingId(request.id)}
                          className="gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
