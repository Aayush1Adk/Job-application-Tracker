import { Application, JobStatus, JobType } from "../types";

interface Props {
  app: Application;
  onEdit: (app: Application) => void;
  onDelete: (app: Application) => void;
}

const STATUS_STYLES: Record<JobStatus, string> = {
  Applied: "bg-blue-100 text-blue-800",
  Interviewing: "bg-yellow-100 text-yellow-800",
  Offer: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const JOB_TYPE_STYLES: Record<JobType, string> = {
  "Full-time": "bg-zinc-100 text-zinc-700",
  "Part-time": "bg-purple-100 text-purple-700",
  Internship: "bg-orange-100 text-orange-700",
};

export default function ApplicationCard({ app, onEdit, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-3 p-4 mb-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900">{app.company_name}</h3>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${JOB_TYPE_STYLES[app.job_type]}`}
            >
              {app.job_type}
            </span>
          </div>
          <p className="text-sm text-gray-500">{app.job_title}</p>
        </div>

        <div className="flex-1 text-left sm:text-center">
          <p className="text-sm text-gray-500">
            Applied on {new Date(app.applied_date).toLocaleDateString()}
          </p>
        </div>

        <div className="flex-1 flex sm:justify-end items-center gap-2">
          <span className="text-xs text-gray-400 uppercase tracking-wide">Status</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[app.status]}`}
          >
            {app.status}
          </span>
        </div>

        <div className="flex gap-2 sm:ml-4">
          <button
            onClick={() => onEdit(app)}
            className="px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(app)}
            className="px-3 py-1.5 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {app.notes && (
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{app.notes}</p>
        </div>
      )}
    </div>
  );
}