import { Application } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  getApplications: async (status?: string, search?: string, page: number = 1) => {

    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search) params.append('search', search);
    params.append('page', page.toString());

    const url = `${API_BASE}/applications?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    
    
    return res.json(); 
  },
  
  createApplication: async (data: Application) => {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create');
    return res.json();
  },

  updateApplication: async (id: string, data: Partial<Application>) => {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update');
    return res.json();
  },

  deleteApplication: async (id: string) => {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete');
    return res.json();
  }
};