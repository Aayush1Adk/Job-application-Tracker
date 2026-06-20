import { Application } from "../types";

interface Props {
  app: Application;
  isDeleting: boolean;
  error: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ app, isDeleting, error, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-900 mb-2">Delete Application</h2>
        <p className="text-sm text-zinc-600 mb-5">
          Are you sure you want to delete the application for{" "}
          <span className="font-semibold">{app.job_title}</span> at{" "}
          <span className="font-semibold">{app.company_name}</span>? This action cannot be
          undone.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-700 rounded-xl font-semibold hover:bg-zinc-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}