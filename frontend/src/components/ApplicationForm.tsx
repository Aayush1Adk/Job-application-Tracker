'use client';

import { useState, useEffect, useTransition } from 'react';
import { Application, JobStatus, JobType } from '../types';

interface Props {
  initialData?: Application | null;
  onSubmit: (data: Application) => Promise<void> | void;
  onCancel: () => void;
}

const getInitialFormData = (initialData?: Application | null): Application => ({
  company_name: initialData?.company_name ?? '',
  job_title: initialData?.job_title ?? '',
  job_type: initialData?.job_type ?? 'Full-time',
  status: initialData?.status ?? 'Applied',
  applied_date: initialData
    ? initialData.applied_date.substring(0, 10)
    : new Date().toLocaleDateString('en-CA'),
  notes: initialData?.notes ?? ''
});

export default function ApplicationForm({ initialData, onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState<Application>(() => getInitialFormData(initialData));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [, startTransition] = useTransition();

  const isEditing = !!initialData;

  useEffect(() => {
    startTransition(() => {
      setFormData(getInitialFormData(initialData));
      setError('');
    });
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');

      const trimmedCompany = formData.company_name.trim();
      const trimmedTitle = formData.job_title.trim();

      if (trimmedCompany.length < 3) {
        setError('Company name must be at least 3 characters');
        return;
      }
      if (trimmedTitle.length < 3) {
        setError('Job title must be at least 3 characters');
        return;
      }

      setIsSubmitting(true);

      const submissionData: Application = {
        company_name: trimmedCompany,
        job_title: trimmedTitle,
        job_type: formData.job_type,
        status: formData.status,
        applied_date: formData.applied_date,
        // Always send notes, even if empty - this lets clearing the field
        // actually clear it server-side instead of silently being dropped.
        notes: formData.notes ? formData.notes.trim() : '',
      };

      await onSubmit(submissionData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-zinc-100 transform transition-all">
        <h2 className="text-2xl font-bold mb-6 text-zinc-900 tracking-tight">
          {initialData ? 'Edit Application' : 'New Application'}
        </h2>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Company Name *</label>
            <input
              required
              minLength={3}
              type="text"
              className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-shadow"
              value={formData.company_name}
              onChange={e => setFormData({ ...formData, company_name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Job Title *</label>
            <input
              required
              minLength={3}
              type="text"
              className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:outline-none transition-shadow"
              value={formData.job_title}
              onChange={e => setFormData({ ...formData, job_title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Job Type</label>
              <select
                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                value={formData.job_type}
                onChange={e => setFormData({ ...formData, job_type: e.target.value as JobType })}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Status</label>
              <select
                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as JobStatus })}
              >
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Date Applied *
              {isEditing && (
                <span className="text-zinc-400 font-normal"> (locked after creation)</span>
              )}
            </label>
            <input
              required
              type="date"
              disabled={isEditing}
              className={`w-full border border-zinc-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-zinc-900 focus:outline-none ${
                isEditing ? 'bg-zinc-100 text-zinc-500 cursor-not-allowed' : ''
              }`}
              value={formData.applied_date}
              onChange={e => setFormData({ ...formData, applied_date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">
              Notes <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 resize-none focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-zinc-200 text-zinc-700 rounded-xl font-semibold hover:bg-zinc-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-md"
            >
              {isSubmitting ? 'Saving...' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}