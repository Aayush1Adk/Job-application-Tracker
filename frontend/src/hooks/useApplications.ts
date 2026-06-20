import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import { Application } from "../types";

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const loadApps = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getApplications(
        filter === "All" ? undefined : filter,
        searchQuery,
        currentPage
      );

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
      setError("Failed to load applications from server");
      setApplications([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, searchQuery, currentPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadApps();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [loadApps]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (status: string) => {
    setFilter(status);
    setCurrentPage(1);
  };

  return {
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
  };
}