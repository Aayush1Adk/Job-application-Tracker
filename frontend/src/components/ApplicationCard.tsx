import { Application, JobStatus } from "../types";

export default function ApplicationCard({ app }: { app: Application }) {

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800';

      case 'Interviewing':
        return 'bg-yellow-100 text-yellow-800';

      case 'Offer':
        return 'bg-green-100 text-green-800';

      case 'Rejected':
        return 'bg-red-100 text-red-800';

      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 mb-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">
          {app.company_name}
        </h3>

        <p className="text-sm text-gray-500">
          {app.job_title} • {app.job_type}
        </p>
      </div>

      <div className="flex-1 text-center hidden sm:block">
        <p className="text-sm text-gray-500">
          Applied on {new Date(app.applied_date).toLocaleDateString()}
        </p>
      </div>

      <div className="flex-1 flex justify-end">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}
        >
          {app.status}
        </span>
      </div>

    </div>
  );
}