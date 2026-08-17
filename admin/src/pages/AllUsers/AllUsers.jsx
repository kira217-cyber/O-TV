import React, { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { toast } from "react-toastify";
import {
  Search,
  RefreshCw,
  Users,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  Tv,
  Ban,
  CheckCircle2,
} from "lucide-react";

import { api } from "../../api/axios";

const PAGE_SIZE = 30;

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadUsers = async (query, pageNumber) => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/admin/users", {
        params: {
          search: query || undefined,
          page: pageNumber,
          limit: PAGE_SIZE,
        },
      });

      const payload = data?.data || data;

      setUsers(payload?.users || []);
      setTotalPages(payload?.totalPages || 1);
      setTotal(payload?.total || 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers("", 1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadUsers(search, 1);
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    loadUsers(search, nextPage);
  };

  const toggleStatus = async (user) => {
    const nextStatus = user.status === "active" ? "inactive" : "active";

    try {
      setTogglingId(user._id);

      await api.patch(`/api/admin/users/${user._id}/status`, {
        status: nextStatus,
      });

      setUsers((prev) =>
        prev.map((item) =>
          item._id === user._id ? { ...item, status: nextStatus } : item,
        ),
      );

      toast.success(
        nextStatus === "active"
          ? "User activated successfully"
          : "User deactivated successfully",
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 px-4 py-3">
            <Users className="h-5 w-5 text-[#8b5cf6]" />
            <span className="text-sm font-bold text-violet-200">
              Studio Users
            </span>
          </div>

          <h1 className="mt-4 bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent md:text-4xl">
            All Users
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Search, review, and manage every Pipra-TV Studio creator account.
            {total > 0 && (
              <span className="ml-1 text-slate-400">({total} total)</span>
            )}
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b5cf6]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
            />
          </div>

          <button
            onClick={() => loadUsers(search, page)}
            disabled={loading}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-5 py-3 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] py-16 text-center text-slate-400 shadow-2xl shadow-black/40 backdrop-blur-xl">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] py-16 text-center text-slate-400 shadow-2xl shadow-black/40 backdrop-blur-xl">
            No users found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => {
              const logoUrl = user.channel?.logo
                ? `${api.defaults.baseURL}${user.channel.logo}`
                : null;

              const isActive = user.status !== "inactive";

              return (
                <div
                  key={user._id}
                  className="flex flex-col gap-4 rounded-[24px] border border-[#8b5cf6]/15 bg-black/30 p-5 shadow-xl shadow-black/30 transition hover:border-[#8b5cf6]/40"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#8b5cf6]/25 bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] text-xl font-black text-white">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={user.channel?.name || user.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        user.fullName?.charAt(0)?.toUpperCase() || "U"
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-black text-white">
                        {user.fullName}
                      </p>

                      {user.channel?.name && (
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs font-semibold text-amber-300">
                          <Tv className="h-3 w-3 shrink-0" />
                          {user.channel.name}
                        </p>
                      )}

                      <span
                        className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-rose-400"}`}
                        />
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-[#8b5cf6]" />
                      <span className="truncate">{user.email}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-[#8b5cf6]" />
                      {user.phone}
                    </span>
                  </div>

                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <NavLink
                      to={`/all-users/${user._id}`}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#8b5cf6]/15 px-3 py-2.5 text-xs font-bold text-violet-200 transition hover:bg-[#8b5cf6]/25"
                    >
                      View Details
                      <ChevronRight className="h-3.5 w-3.5" />
                    </NavLink>

                    <button
                      type="button"
                      onClick={() => toggleStatus(user)}
                      disabled={togglingId === user._id}
                      className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition disabled:opacity-60 ${
                        isActive
                          ? "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                          : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                      }`}
                    >
                      {isActive ? (
                        <Ban className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      {isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </button>

            <span className="text-sm font-semibold text-slate-300">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-sm font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
