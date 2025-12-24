import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  LogOut,
  Plus,
  List,
  BarChart3
} from 'lucide-react';
import { SummaryReport } from '@/shared/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    fetchSummary();
  }, [isAuthenticated]);

  const fetchSummary = async () => {
    try {
      const response = await api.get<{ data: SummaryReport }>('/reports/summary');
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const statusData = summary
    ? [
        { name: 'في انتظار', value: summary.pendingRequests, color: '#f59e0b' },
        { name: 'موافق', value: summary.approvedRequests, color: '#3b82f6' },
        { name: 'تم التنفيذ', value: summary.completedRequests, color: '#10b981' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/images/logo.jpg" alt="Mada Tourism" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
                <p className="text-sm text-muted-foreground">
                  مرحباً {user?.username} ({user?.role})
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setLocation('/requests/new')} className="gap-2">
                <Plus className="w-4 h-4" />
                طلب جديد
              </Button>
              <Button onClick={() => setLocation('/requests')} variant="outline" className="gap-2">
                <List className="w-4 h-4" />
                جميع الطلبات
              </Button>
              <Button onClick={() => setLocation('/reports')} variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                التقارير
              </Button>
              <Button onClick={handleLogout} variant="destructive" className="gap-2">
                <LogOut className="w-4 h-4" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-md border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">إجمالي الطلبات</p>
                      <p className="text-3xl font-bold font-numbers text-primary">
                        {summary?.totalRequests || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">هذا الشهر</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">إجمالي المبالغ</p>
                      <p className="text-3xl font-bold font-numbers text-accent">
                        {(summary?.totalAmount || 0).toLocaleString('ar-SA')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">ريال سعودي</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">تم التنفيذ</p>
                      <p className="text-3xl font-bold font-numbers text-green-600">
                        {summary?.completedRequests || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">طلب مكتمل</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">في الانتظار</p>
                      <p className="text-3xl font-bold font-numbers text-orange-600">
                        {summary?.pendingRequests || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">طلب معلق</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">توزيع الطلبات حسب الحالة</CardTitle>
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
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-border/50">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">إحصائيات الطلبات</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#1e3a5f" name="عدد الطلبات" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle className="text-xl font-bold">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setLocation('/requests/new')}
                    variant="outline"
                    className="h-auto py-6 gap-3"
                  >
                    <Plus className="w-5 h-5" />
                    <div className="text-right">
                      <p className="font-bold">إنشاء طلب جديد</p>
                      <p className="text-xs text-muted-foreground">إضافة طلب صرف جديد</p>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setLocation('/requests')}
                    variant="outline"
                    className="h-auto py-6 gap-3"
                  >
                    <List className="w-5 h-5" />
                    <div className="text-right">
                      <p className="font-bold">عرض جميع الطلبات</p>
                      <p className="text-xs text-muted-foreground">البحث والفلترة</p>
                    </div>
                  </Button>

                  <Button
                    onClick={() => setLocation('/reports')}
                    variant="outline"
                    className="h-auto py-6 gap-3"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <div className="text-right">
                      <p className="font-bold">التقارير</p>
                      <p className="text-xs text-muted-foreground">تصدير وإحصائيات</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
