"use client";

import { useState, useEffect } from "react";
import { api } from "../lib/api";
import ApplicationCard from "../components/ApplicationCard";
import { Application } from "../types";

// 1. Tell TypeScript exactly what an Application looks like based on your database


export default function Dashboard() {

  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isCurrent = true;

    const loadApps = async () => {
      setLoading(true);
      try {
        const response = await api.getApplications(
          filter === "All" ? undefined : filter, 
          searchQuery, 
          currentPage
        );

        if (!isCurrent) return;


        if (response && response.data && Array.isArray(response.data)) {
          setApplications(response.data);
        } else if (Array.isArray(response)) {
          setApplications(response);
        } else {
          setApplications([]);
        }

        setTotalPages(response?.pagination?.totalPages || 1);
        setError("");
      } catch (err) {
        if (!isCurrent) return;
        setError("Failed to load applications from server");
        setApplications([]);
        console.error(err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      loadApps();
    }, 300);

    return () => {
      isCurrent = false;
      clearTimeout(delayDebounceFn);
    };
  }, [filter, searchQuery, currentPage]);


  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (status: string) => {
    setFilter(status);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black">Job Applications</h1>
            <p className="text-gray-500 mt-1">Track and manage your job hunt efficiently.</p>
          </div>
          <button className="bg-black text-white px-5 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">
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
              {/* 3. Replaced 'any' with 'Application' */}
              {applications.map((app: Application) => (
                <ApplicationCard key={app.id} app={app} />
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
    </main>
  );
}
