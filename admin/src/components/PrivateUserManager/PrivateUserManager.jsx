import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff, Pencil, Save, Trash2, X, UserRoundCog } from "lucide-react";

import { api } from "../../api/axios";

const PrivateUserManager = () => {
  const [playlists, setPlaylists] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [assignedPlaylists, setAssignedPlaylists] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const base = api.defaults.baseURL;

  const loadPlaylists = async () => {
    try {
      const { data } = await api.get("/api/admin/private-playlists");
      setPlaylists(data?.data?.playlists || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load playlists");
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data } = await api.get("/api/admin/private-users");
      setUsers(data?.data?.users || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load private users");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadPlaylists();
    loadUsers();
  }, []);

  const togglePlaylist = (id) => {
    setAssignedPlaylists((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setEmail("");
    setPhone("");
    setPassword("");
    setShowPassword(false);
    setAssignedPlaylists([]);
  };

  const startEdit = (user) => {
    setEditingId(user._id || user.id);
    setEmail(user.email);
    setPhone(user.phone);
    setPassword("");
    setShowPassword(false);
    setAssignedPlaylists(
      (user.assignedPlaylists || []).map((p) => p._id || p.id || p),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !phone.trim()) {
      toast.error("Email and phone are required");
      return;
    }

    if (!editingId && !password.trim()) {
      toast.error("Password is required");
      return;
    }

    if (password.trim() && password.trim().length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        email: email.trim(),
        phone: phone.trim(),
        assignedPlaylists,
      };
      if (password.trim()) payload.password = password.trim();

      if (editingId) {
        await api.put(`/api/admin/private-users/${editingId}`, payload);
        toast.success("Private user updated");
      } else {
        await api.post("/api/admin/private-users", payload);
        toast.success("Private user created");
      }

      resetForm();
      loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save the user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    const id = user._id || user.id;
    if (!window.confirm(`Delete "${user.email}"?`)) return;

    try {
      setDeletingId(id);
      await api.delete(`/api/admin/private-users/${id}`);
      setUsers((prev) => prev.filter((item) => (item._id || item.id) !== id));
      if (editingId === id) resetForm();
      toast.success("Private user deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete the user");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 text-white">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] shadow-lg shadow-[#8b5cf6]/30">
          <UserRoundCog className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-3xl font-black text-transparent">
            Private User
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create viewer accounts and assign which playlists they can watch.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
      >
        <h2 className="text-lg font-black text-white">
          {editingId ? "Edit Private User" : "Add Private User"}
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="viewer@example.com"
              className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-200">
            {editingId ? "New Password (optional)" : "Password"}
          </label>
          <div className="flex items-center rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 transition focus-within:border-[#8b5cf6]/70 focus-within:ring-2 focus-within:ring-[#8b5cf6]/20">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={editingId ? "Leave empty to keep current password" : "Minimum 6 characters"}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="cursor-pointer text-slate-300 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-semibold text-slate-200">
            Assigned Playlists
          </label>

          {playlists.length === 0 ? (
            <p className="text-xs text-slate-400">
              No playlists exist yet — create one under Private Video Playlist first.
            </p>
          ) : (
            <div className="grid max-h-72 grid-cols-1 gap-3 overflow-y-auto pr-1 [scrollbar-width:none] sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((playlist) => {
                const id = playlist._id || playlist.id;
                return (
                  <label
                    key={id}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/30 px-4 py-3 transition hover:border-[#8b5cf6]/40 hover:bg-[#8b5cf6]/10"
                  >
                    <input
                      type="checkbox"
                      checked={assignedPlaylists.includes(id)}
                      onChange={() => togglePlaylist(id)}
                      className="h-4 w-4 cursor-pointer accent-[#8b5cf6]"
                    />
                    <img
                      src={`${base}${playlist.logo}`}
                      alt={playlist.title}
                      className="h-8 w-8 shrink-0 rounded-lg object-cover"
                    />
                    <span className="truncate text-sm font-semibold text-white">
                      {playlist.title}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : editingId ? "Update User" : "Create User"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-black/30 px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-[#8b5cf6]/15"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
        <h2 className="mb-4 text-lg font-black text-white">
          Private Users {users.length > 0 && `(${users.length})`}
        </h2>

        {loadingUsers ? (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            No private users yet — add one above.
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const id = user._id || user.id;

              return (
                <div
                  key={id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{user.email}</p>
                    <p className="truncate text-xs text-slate-400">{user.phone}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {(user.assignedPlaylists || []).length > 0
                        ? user.assignedPlaylists.map((p) => p.title).join(", ")
                        : "No playlists assigned"}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(user)}
                      className="flex cursor-pointer items-center justify-center rounded-lg bg-[#8b5cf6]/15 px-3 py-2 text-violet-200 transition hover:bg-[#8b5cf6]/25"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === id}
                      className="flex cursor-pointer items-center justify-center rounded-lg bg-rose-500/15 px-3 py-2 text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateUserManager;
