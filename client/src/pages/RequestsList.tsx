import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { Request as RequestType } from '@/shared/types';
import { toast } from 'sonner';

export default function RequestsList() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    fetchRequests();
  }, [isAuthenticated, page]);

  const fetchRequests = async () => {
    try {
      const response = await api.get(`/requests?page=${page}&limit=10`);
      setRequests(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchRequests();
      return;
    }

    try {
      const response = await api.get(`/requests/search?query=${searchQuery}`);
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error searching requests:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      return;
    }

    try {
      await api.delete(`/requests/${id}`);
      toast.success('تم حذف الطلب بنجاح');
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      'في انتظار': { variant: 'secondary', label: 'في انتظار' },
      'موافق': { variant: 'default', label: 'موافق' },
      'تم التنفيذ': { variant: 'default', label: 'تم التنفيذ' },
      'تم التعميد': { variant: 'outline', label: 'تم التعميد' },
    };

    const config = statusConfig[status] || statusConfig['في انتظار'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => setLocation('/dashboard')} variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">جميع الطلبات</h1>
                <p className="text-sm text-muted-foreground">عرض وإدارة طلبات الصرف</p>
              </div>
            </div>
            <Button onClick={() => setLocation('/requests/new')} className="gap-2">
              <Plus className="w-4 h-4" />
              طلب جديد
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {/* Search Bar */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="البحث برقم الطلب، الاسم، أو القسم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} className="gap-2">
                  <Search className="w-4 h-4" />
                  بحث
                </Button>
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                فلترة
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>الطلبات ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد طلبات</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">رقم الطلب</TableHead>
                        <TableHead className="text-right">مقدم الطلب</TableHead>
                        <TableHead className="text-center">القسم</TableHead>
                        <TableHead className="text-center">المبلغ</TableHead>
                        <TableHead className="text-center">الحالة</TableHead>
                        <TableHead className="text-center">التاريخ</TableHead>
                        <TableHead className="text-center">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="text-center font-numbers font-bold">
                            {request.requestNumber}
                          </TableCell>
                          <TableCell>{request.requesterName}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{request.department}</Badge>
                          </TableCell>
                          <TableCell className="text-center font-numbers">
                            {request.amountInNumbers.toLocaleString('ar-SA')} ريال
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="text-center font-numbers text-sm text-muted-foreground">
                            {new Date(request.createdAt).toLocaleDateString('ar-SA')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setLocation(`/requests/${request.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setLocation(`/requests/${request.id}/edit`)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(request.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    السابق
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    صفحة {page} من {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    التالي
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
