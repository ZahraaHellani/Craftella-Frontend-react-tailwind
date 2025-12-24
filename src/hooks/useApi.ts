import { useState, useEffect } from 'react';

// Define TypeScript interfaces
interface ApiError {
  message: string;
  status?: number;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

const API_BASE = 'http://localhost:8000/api';

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const useApi = <T,>(url: string, options?: { method: string; body: any }) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        method: options?.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError({
        message: err.message || 'An error occurred',
        status: err.status,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

// Required for TypeScript isolatedModules
export {};