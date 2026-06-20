import { JobStatus } from '../types';

export default function StatusBadge({ status }: { status: JobStatus }) {
  const styles = {
    Applied: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    Interviewing: 'bg-zinc-800 text-zinc-100 border-zinc-900',
    Offer: 'bg-green-50 text-green-700 border-green-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium border rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}