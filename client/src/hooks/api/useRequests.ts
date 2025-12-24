import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Request } from '@shared/const';

const API_BASE_URL = '/api/requests';

export interface RequestInput {
  paymentType: string;
  requesterName: string;
  jobTitle: string;
  department: string;
  approverDepartment: string;
  amountInNumbers: number;
}

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<Request[]>(API_BASE_URL);
      setRequests(response.data);
    } catch (err) {
      setError('حدث خطأ في جلب الطلبات');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return { requests, loading, error, refetch: fetchRequests };
}

export function useRequest(id: number | null) {
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setRequest(null);
      return;
    }

    const fetchRequest = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<Request>(`${API_BASE_URL}/${id}`);
        setRequest(response.data);
      } catch (err) {
        setError('حدث خطأ في جلب الطلب');
        console.error('Error fetching request:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  return { request, loading, error };
}

export async function createRequest(data: RequestInput): Promise<Request> {
  try {
    const response = await axios.post<Request>(API_BASE_URL, data);
    return response.data;
  } catch (err) {
    console.error('Error creating request:', err);
    throw new Error('حدث خطأ في إنشاء الطلب');
  }
}

export async function updateRequest(id: number, data: Partial<RequestInput> & { status?: string }): Promise<Request> {
  try {
    const response = await axios.put<Request>(`${API_BASE_URL}/${id}`, data);
    return response.data;
  } catch (err) {
    console.error('Error updating request:', err);
    throw new Error('حدث خطأ في تحديث الطلب');
  }
}

export async function deleteRequest(id: number): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
  } catch (err) {
    console.error('Error deleting request:', err);
    throw new Error('حدث خطأ في حذف الطلب');
  }
}
