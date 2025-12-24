import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Table
} from 'lucide-react';
import { DepartmentReport, MonthlyReport } from '@/shared/types';

export default function Reports() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [departmentData, setDepartmentData] = useState<DepartmentReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    fetchDepartmentData();
  }, [isAuthenticated]);

  const fetchDepartmentData = async () => {
    try {
      const response = await api.get<{ data: DepartmentReport[] }>('/reports/by-department');
      setDepartmentData(response.data.data);
    } catch (error) {
      console.error('Error fetching department data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    try {
      const response = await api.get(`/reports/export/${format}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extensions = { excel: 'xlsx', pdf: 'pdf', csv: 'csv' };
      link.setAttribute('download', `requests.${extensions[format]}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
    }
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
                <h1 className="text-2xl font-bold text-foreground">التقارير والإحصائيات</h1>
                <p className="text-sm text-muted-foreground">عرض وتصدير التقارير</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleExport('excel')} variant="outline" className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </Button>
              <Button onClick={() => handleExport('pdf')} variant="outline" className="gap-2">
                <FileText className="w-4 h-4" />
                PDF
              </Button>
              <Button onClick={() => handleExport('csv')} variant="outline" className="gap-2">
                <Table className="w-4 h-4" />
                CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {/* Export Options */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>خيارات التصدير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                onClick={() => handleExport('excel')}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold">تصدير Excel</h3>
                      <p className="text-sm text-muted-foreground">
                        تصدير جميع البيانات مع التنسيق الكامل
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                onClick={() => handleExport('pdf')}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold">تصدير PDF</h3>
                      <p className="text-sm text-muted-foreground">
                        تصدير تقرير PDF جاهز للطباعة
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                onClick={() => handleExport('csv')}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Table className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold">تصدير CSV</h3>
                      <p className="text-sm text-muted-foreground">
                        تصدير بيانات CSV للمعالجة
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Department Statistics */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>إحصائيات الأقسام</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 font-bold">القسم</th>
                      <th className="text-center py-3 px-4 font-bold">عدد الطلبات</th>
                      <th className="text-center py-3 px-4 font-bold">إجمالي المبالغ</th>
                      <th className="text-center py-3 px-4 font-bold">متوسط المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentData.map((dept, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{dept.department}</td>
                        <td className="text-center py-3 px-4 font-numbers">
                          {dept.requestCount}
                        </td>
                        <td className="text-center py-3 px-4 font-numbers font-bold text-accent">
                          {dept.totalAmount.toLocaleString('ar-SA')} ريال
                        </td>
                        <td className="text-center py-3 px-4 font-numbers">
                          {dept.avgAmount.toFixed(2)} ريال
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
