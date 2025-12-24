import { useState } from "react";
import { Button } from "@/components/ui/button";
import RequestForm, { RequestFormData } from "@/components/requests/RequestForm";
import RequestsList from "@/components/requests/RequestsList";
import {
  useRequests,
  createRequest,
  updateRequest,
  deleteRequest,
} from "@/hooks/api/useRequests";
import { Request, RequestStatus } from "@shared/const";
import { Plus, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function RequestsPage() {
  const { requests, loading, error, refetch } = useRequests();
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);

  const handleCreateRequest = async (data: RequestFormData) => {
    await createRequest(data);
    setShowForm(false);
    await refetch();
  };

  const handleUpdateRequest = async (data: RequestFormData) => {
    if (!editingRequest) return;
    await updateRequest(editingRequest.id, data);
    setEditingRequest(null);
    await refetch();
  };

  const handleDeleteRequest = async (id: number) => {
    await deleteRequest(id);
    await refetch();
  };

  const handleUpdateStatus = async (id: number, status: RequestStatus) => {
    await updateRequest(id, { status });
    await refetch();
  };

  const handleEdit = (request: Request) => {
    setEditingRequest(request);
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
                <h1 className="text-2xl font-bold text-foreground">إدارة طلبات الصرف</h1>
                <p className="text-sm text-muted-foreground">
                  نظام إدارة طلبات الصرف لشركة مدى السياحية
                </p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              طلب جديد
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {/* Statistics Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold font-numbers">{requests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">في انتظار التعميد</p>
                <p className="text-2xl font-bold font-numbers">
                  {requests.filter((r) => r.status === 'في انتظار التعميد').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">موافق عليها</p>
                <p className="text-2xl font-bold font-numbers">
                  {requests.filter((r) => r.status === 'موافق عليها').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تم التنفيذ</p>
                <p className="text-2xl font-bold font-numbers">
                  {requests.filter((r) => r.status === 'تم التنفيذ').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        {/* Requests List */}
        <RequestsList
          requests={requests}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onUpdateStatus={handleUpdateStatus}
          loading={loading}
        />
      </main>

      {/* Create Request Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>طلب صرف جديد</DialogTitle>
          </DialogHeader>
          <RequestForm
            mode="create"
            onSubmit={handleCreateRequest}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Request Dialog */}
      <Dialog open={editingRequest !== null} onOpenChange={() => setEditingRequest(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل طلب الصرف</DialogTitle>
          </DialogHeader>
          <RequestForm
            mode="edit"
            request={editingRequest}
            onSubmit={handleUpdateRequest}
            onCancel={() => setEditingRequest(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
