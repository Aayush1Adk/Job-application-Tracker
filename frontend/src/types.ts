export type JobType = 'Internship' | 'Full-time' | 'Part-time';
export type JobStatus = 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface Application {
  id?: number;
  company_name: string;
  job_title: string;
  job_type: JobType;
  status: JobStatus;
  applied_date: string;
  notes?: string;
}