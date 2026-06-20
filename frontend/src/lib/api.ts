import { Application } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function handleResponse(res: Response) {
  if (!res.ok) {
    let message = 'Something went wrong';
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // response had no JSON body, fall back to generic message
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  getApplications: async (jobType?: string, search?: string, page: number = 1) => {

    const params = new URLSearchParams();
    if (jobType && jobType !== 'All') params.append('job_type', jobType);
    if (search) params.append('search', search);
    params.append('page', page.toString());

    const url = `${API_BASE}/applications?${params.toString()}`;
    const res = await fetch(url);
    return handleResponse(res);
  },
  
  createApplication: async (data: Application) => {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  updateApplication: async (id: string, data: Partial<Application>) => {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  deleteApplication: async (id: string) => {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  }
};