"use client";

import type { AdminUserRow } from "@/types/admin";
import { useCallback, useEffect, useState } from "react";

interface UseAdminUsersResult {
  users: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refresh: () => void;
}

export function useAdminUsers(
  initialPage = 1,
  pageSize = 10,
): UseAdminUsersResult {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(pageSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users?page=${page}&limit=${limit}`);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    total,
    page,
    limit,
    loading,
    error,
    goToPage: setPage,
    setPageSize: (size: number) => {
      setLimit(size);
      setPage(1);
    },
    refresh: fetchUsers,
  };
}
