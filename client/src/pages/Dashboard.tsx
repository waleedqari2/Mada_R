import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { reportsApi, requestsApi, notificationsApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Bell,
  Calendar,
  Building2,
  Users,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [summary, setSummary] = useState<any>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [summaryData, requestsData, notificationsData] = await Promise.all([
        reportsApi.getSummary(),
        requestsApi.getAll({ page: 1, limit: 5 }),
        notificationsApi.getAll({ page: 1, limit: 5, unreadOnly: true }),
      ]);

      setSummary(summaryData);
      setRecentRequests(requestsData.requests || []);
      setNotifications(notificationsData.notifications || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#1e3a5f', '#d4af37', '#e63946', '#06d6a0'];

  const statusData = summary?.statusStats?.map((stat: any) => ({
    name: stat.status === 'pending' ? 'قيد الانتظار' : stat.status === 'approved' ? 'موافق عليه' : stat.status === 'rejected' ? 'مرفوض' : 'مكتمل',
    value: stat.count,
    amount: stat.total_amount,
  })) || [];

  const departmentData = summary?.departmentStats?.slice(0, 5).map((dept: any) => ({
    name: dept.department,
    total: dept.total_amount,
    count: dept.count,
  })) || [];

  const activityData = summary?.recentActivity?.slice(0, 7).reverse().map((activity: any) => ({
    date: new Date(activity.date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
    count: activity.count,
    amount: activity.total_amount,
  })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">لوحة التحكم</h1>
              <p className="text-muted-foreground mt-1">
                مرحباً {user?.full_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {user?.role === 'admin' ? 'مدير' : user?.role === 'manager' ? 'مدير قسم' : 'موظف'}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {user?.department}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalStats?.total_requests || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">جميع الطلبات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الطلبات المعتمدة</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {summary?.statusStats?.find((s: any) => s.status === 'approved')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">تم الموافقة عليها</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {summary?.statusStats?.find((s: any) => s.status === 'pending')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">في انتظار المراجعة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المبالغ</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(summary?.totalStats?.total_amount || 0).toLocaleString('ar-SA')} ر.س
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                متوسط: {(summary?.totalStats?.avg_amount || 0).toLocaleString('ar-SA', { maximumFractionDigits: 0 })} ر.س
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع الطلبات حسب الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Stats */}
          <Card>
            <CardHeader>
              <CardTitle>أعلى الأقسام طلباً</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#1e3a5f" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>النشاط الأخير (آخر 7 أيام)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="left" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#1e3a5f" name="عدد الطلبات" />
                <Line yAxisId="right" type="monotone" dataKey="amount" stroke="#d4af37" name="المبلغ (ر.س)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Requests and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>آخر الطلبات</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setLocation('/')}>
                عرض الكل
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRequests.length > 0 ? (
                  recentRequests.map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{request.request_number}</p>
                        <p className="text-sm text-muted-foreground">{request.beneficiary}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{request.total_amount.toLocaleString('ar-SA')} ر.س</p>
                        <Badge
                          variant={
                            request.status === 'approved' ? 'default' :
                            request.status === 'pending' ? 'secondary' :
                            request.status === 'rejected' ? 'destructive' : 'outline'
                          }
                          className="text-xs"
                        >
                          {request.status === 'pending' ? 'قيد الانتظار' :
                           request.status === 'approved' ? 'موافق عليه' :
                           request.status === 'rejected' ? 'مرفوض' : 'مكتمل'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">لا توجد طلبات</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>الإشعارات</CardTitle>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification: any) => (
                    <div key={notification.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                      <div className={`rounded-full p-2 ${
                        notification.type === 'success' ? 'bg-green-100' :
                        notification.type === 'error' ? 'bg-red-100' :
                        notification.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <Bell className={`h-4 w-4 ${
                          notification.type === 'success' ? 'text-green-600' :
                          notification.type === 'error' ? 'text-red-600' :
                          notification.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">لا توجد إشعارات جديدة</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
