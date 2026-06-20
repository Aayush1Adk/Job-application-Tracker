"use client";

import { useState } from "react";
import { api } from "../lib/api";
import ApplicationCard from "../components/ApplicationCard";
import ApplicationForm from "../components/ApplicationForm";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { useApplications } from "../hooks/useApplications";
import { Application } from "../types";

export default function Dashboard() {
  const {
    applications,
    filter,
    searchQuery,
    currentPage,
    totalPages,
    loading,
    error,
    loadApps,
    setCurrentPage,
    handleSearchChange,
    handleFilterChange,
  } = useApplications();

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [formError, setFormError] = useState<string>("");

  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>("");

  const openAddForm = () => {
    setEditingApp(null);
    setFormError("");
    setIsFormOpen(true);
  };

  const openEditForm = (app: Application) => {
    setEditingApp(app);
    setFormError("");
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingApp(null);
    setFormError("");
  };

  const handleFormSubmit = async (data: Application) => {
    try {
      setFormError("");
      if (editingApp && editingApp.id !== undefined) {
        await api.updateApplication(String(editingApp.id), data);
      } else {
        await api.createApplication(data);
      }
      closeForm();
      await loadApps();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save application";
      setFormError(message);
      throw err;
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleteTarget.id === undefined) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await api.deleteApplication(String(deleteTarget.id));
      setDeleteTarget(null);

      if (applications.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1);
      } else {
        await loadApps();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete application";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">Job Applications</h1>
            <p className="text-gray-500 mt-1">Track and manage your job hunt efficiently.</p>
          </div>
          <button
            onClick={openAddForm}
            className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            + Add Application
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search company, title, or notes..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full sm:w-72 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none bg-white"
          />

          <div className="flex space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {["All", "Applied", "Interviewing", "Offer", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-6 mb-6">
          {loading ? (
            <div className="text-center py-10 text-gray-500 animate-pulse">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No applications found.</div>
          ) : (
            <div className="flex flex-col">
              {applications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onEdit={openEditForm}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>

            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {isFormOpen && (
        <ApplicationForm initialData={editingApp} onSubmit={handleFormSubmit} onCancel={closeForm} />
      )}
      {isFormOpen && formError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg z-[60]">
          {formError}
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          app={deleteTarget}
          isDeleting={isDeleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </main>
  );
}