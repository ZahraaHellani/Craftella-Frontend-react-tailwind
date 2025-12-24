const API_BASE = 'http://localhost:8000/api';

const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  get: (url: string) => fetch(`${API_BASE}${url}`, {
    headers: getAuthHeader(),
  }).then(res => res.json()),

  post: (url: string, data: any) => fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json()),

  put: (url: string, data: any) => fetch(`${API_BASE}${url}`, {
    method: 'PUT',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json()),

  patch: (url: string, data: any) => fetch(`${API_BASE}${url}`, {
    method: 'PATCH',
    headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(res => res.json()),

  del: (url: string) => fetch(`${API_BASE}${url}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  }).then(res => res.json()),
};