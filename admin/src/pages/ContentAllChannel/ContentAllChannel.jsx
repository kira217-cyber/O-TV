import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Search, Tv } from "lucide-react";

import { api } from "../../api/axios";
import HomeSectionEditor from "../../components/HomeSectionEditor/HomeSectionEditor";

const ChannelCurationManager = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const loadUsers = async (query) => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/users", {
        params: { search: query || undefined, limit: 50 },
      });
      const all = data?.data?.users || [];
      setUsers(all.filter((user) => user.channel?.name));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load channels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers("");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadUsers(search), 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleFeatured = async (user) => {
    const id = user._id || user.id;
    const nextFeatured = !user.channel?.featured;

    try {
      setTogglingId(id);
      await api.patch(`/api/admin/users/${id}/channel/featured`, {
        featured: nextFeatured,
      });
      setUsers((prev) =>
        prev.map((item) =>
          (item._id || item.id) === id
            ? { ...item, channel: { ...item.channel, featured: nextFeatured } }
            : item,
        ),
      );
      toast.success(
        nextFeatured
          ? "Channel is now shown on the home page"
          : "Channel removed from the home page",
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update channel visibility");
    } finally {
      setTogglingId(null);
    }
  };

  const base = api.defaults.baseURL;

  return (
    <div className="mt-8 max-w-2xl rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
      <h2 className="mb-1 text-lg font-black text-white">Featured Channels</h2>
      <p className="mb-4 text-xs text-slate-400">
        Only checked channels appear in the All Channel row on the home page.
      </p>

      <div className="relative mb-4 w-full">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b5cf6]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search channels by name, email, or phone..."
          className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
        />
      </div>

      {loading ? (
        <div className="py-10 text-center text-slate-400">Loading...</div>
      ) : users.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          No channels found{search ? ` matching "${search}"` : ""}.
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((user) => {
            const id = user._id || user.id;

            return (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/25 p-3 transition hover:border-[#8b5cf6]/40"
              >
                {user.channel?.logo ? (
                  <img
                    src={`${base}${user.channel.logo}`}
                    alt={user.channel.name}
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#8b5cf6]/15 text-violet-300">
                    <Tv className="h-4 w-4" />
                  </div>
                )}

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {user.channel.name}
                  </span>
                  <span className="block truncate text-xs text-slate-400">
                    {user.fullName} · {user.email}
                  </span>
                </span>

                <input
                  type="checkbox"
                  checked={Boolean(user.channel?.featured)}
                  disabled={togglingId === id}
                  onChange={() => toggleFeatured(user)}
                  className="h-5 w-5 shrink-0 cursor-pointer accent-[#8b5cf6]"
                />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ContentAllChannel = () => (
  <>
    <HomeSectionEditor sectionKey="allChannel" pageTitle="All Channels Section" />
    <ChannelCurationManager />
  </>
);

export default ContentAllChannel;
