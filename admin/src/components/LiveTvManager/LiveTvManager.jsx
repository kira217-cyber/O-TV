import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Search,
  ImageUp,
  ListChecks,
  Pencil,
  Pin,
  Save,
  Trash2,
  X,
  Tv,
  Home as HomeIcon,
} from "lucide-react";

import { api } from "../../api/axios";

const LiveTvManager = () => {
  const [sourceChannels, setSourceChannels] = useState([]);
  const [loadingSource, setLoadingSource] = useState(true);
  const [sourceSearch, setSourceSearch] = useState("");

  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [listLimit, setListLimit] = useState(10);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [listFilter, setListFilter] = useState("all");
  const [channelSearch, setChannelSearch] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [streamUrl, setStreamUrl] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showOnList, setShowOnList] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [homeFeatured, setHomeFeatured] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadSource = async () => {
    try {
      setLoadingSource(true);
      const { data } = await api.get("/api/admin/site/live-tv-source");
      setSourceChannels(data?.data?.channels || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load the channel source list",
      );
    } finally {
      setLoadingSource(false);
    }
  };

  const loadChannels = async () => {
    try {
      setLoadingChannels(true);
      const { data } = await api.get("/api/admin/site/live-tv-channels");
      setChannels(data?.data?.channels || []);
      setCategories(data?.data?.categories || []);
      setListLimit(data?.data?.listLimit || 10);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load Live TV channels");
    } finally {
      setLoadingChannels(false);
    }
  };

  useEffect(() => {
    const init = () => {
      loadSource();
      loadChannels();
    };

    init();
  }, []);

  // Channels already in the managed list are hidden from the source list —
  // scrolling past hundreds of entries you've already added is the slowest
  // part of setting this up. Matched on stream URL and on name, since a
  // channel's URL is sometimes swapped out after it was added.
  const addedStreamUrls = new Set(channels.map((channel) => channel.streamUrl));
  const addedNames = new Set(
    channels.map((channel) => channel.name?.trim().toLowerCase()),
  );

  const unaddedSource = sourceChannels.filter(
    (entry) =>
      !addedStreamUrls.has(entry.url) &&
      !addedNames.has(entry.name?.trim().toLowerCase()),
  );

  const alreadyAddedCount = sourceChannels.length - unaddedSource.length;

  const filteredSource = sourceSearch.trim()
    ? unaddedSource.filter((entry) =>
        entry.name?.toLowerCase().includes(sourceSearch.trim().toLowerCase()),
      )
    : unaddedSource;

  const pickFromSource = (entry) => {
    setName(entry.name || "");
    setStreamUrl(entry.url || "");
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Logo must be PNG, JPG, JPEG, WEBP, or GIF");
      e.target.value = "";
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const toggleCategory = (key) => {
    setSelectedCategories((previous) =>
      previous.includes(key)
        ? previous.filter((entry) => entry !== key)
        : [...previous, key],
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setStreamUrl("");
    setSelectedCategories([]);
    setShowOnList(false);
    setPinned(false);
    setHomeFeatured(false);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const startEdit = (channel) => {
    setEditingId(channel._id || channel.id);
    setName(channel.name);
    setStreamUrl(channel.streamUrl);
    setSelectedCategories(channel.categories || []);
    setShowOnList(Boolean(channel.showOnList));
    setPinned(Boolean(channel.pinned));
    setHomeFeatured(Boolean(channel.homeFeatured));
    setLogoFile(null);
    setLogoPreview(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // How many channels a category already shows directly on the Live TV
  // page, ignoring the one being edited so re-saving it isn't blocked by
  // its own entry. The server re-checks this (and also counts Pipra-TV,
  // which isn't in this list) — this is just so the limit is visible
  // while filling the form instead of only after hitting Save.
  const listCountFor = (key, excludeId) =>
    channels.filter(
      (channel) =>
        channel.showOnList &&
        channel.categories?.includes(key) &&
        (channel._id || channel.id) !== excludeId,
    ).length;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !streamUrl.trim()) {
      toast.error("Name and stream URL are required");
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Choose at least one category for this channel");
      return;
    }

    if (showOnList) {
      const fullKey = selectedCategories.find(
        (key) => listCountFor(key, editingId) >= listLimit,
      );

      if (fullKey) {
        const label = categories.find((entry) => entry.key === fullKey)?.label;
        toast.error(
          `"${label}" already shows ${listLimit} channels on the Live TV page — remove one first.`,
        );
        return;
      }
    }

    if (!editingId && !logoFile) {
      toast.error("A logo image is required");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("streamUrl", streamUrl.trim());
      formData.append("categories", JSON.stringify(selectedCategories));
      formData.append("showOnList", String(showOnList));
      formData.append("pinned", String(pinned));
      formData.append("homeFeatured", String(homeFeatured));
      if (logoFile) formData.append("logo", logoFile);

      if (editingId) {
        await api.put(`/api/admin/site/live-tv-channels/${editingId}`, formData);
        toast.success("Live TV channel updated");
      } else {
        await api.post("/api/admin/site/live-tv-channels", formData);
        toast.success("Live TV channel created");
      }

      resetForm();
      loadChannels();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save the channel");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (channel) => {
    const id = channel._id || channel.id;
    if (!window.confirm(`Delete "${channel.name}"?`)) return;

    try {
      setDeletingId(id);
      await api.delete(`/api/admin/site/live-tv-channels/${id}`);
      setChannels((prev) => prev.filter((item) => (item._id || item.id) !== id));
      if (editingId === id) resetForm();
      toast.success("Live TV channel deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete the channel");
    } finally {
      setDeletingId(null);
    }
  };

  const base = api.defaults.baseURL;

  const channelCategoryLabels = (channel) => {
    const labels = (channel.categories || [])
      .map((key) => categories.find((entry) => entry.key === key)?.label)
      .filter(Boolean);

    return labels.length > 0 ? labels.join(", ") : "Uncategorized";
  };

  const pinnedCount = channels.filter((channel) => channel.pinned).length;

  const byFilter =
    listFilter === "all"
      ? channels
      : listFilter === "pinned"
        ? channels.filter((channel) => channel.pinned)
        : listFilter === "onList"
          ? channels.filter((channel) => channel.showOnList)
          : listFilter === "uncategorized"
            ? channels.filter((channel) => !channel.categories?.length)
            : channels.filter((channel) => channel.categories?.includes(listFilter));

  const channelQuery = channelSearch.trim().toLowerCase();
  const listedChannels = channelQuery
    ? byFilter.filter((channel) => channel.name?.toLowerCase().includes(channelQuery))
    : byFilter;

  const uncategorizedCount = channels.filter(
    (channel) => !channel.categories?.length,
  ).length;

  return (
    <div className="mt-8 space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
          <h2 className="mb-1 text-lg font-black text-white">Channel Source</h2>
          <p className="mb-4 text-xs text-slate-400">
            Search the external IPTV list — click one to autofill the form.
            {alreadyAddedCount > 0 && (
              <span className="mt-1 block text-emerald-300/80">
                {alreadyAddedCount} already-added channel
                {alreadyAddedCount > 1 ? "s are" : " is"} hidden from this list.
              </span>
            )}
          </p>

          <div className="relative mb-4 w-full">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b5cf6]" />
            <input
              type="text"
              value={sourceSearch}
              onChange={(e) => setSourceSearch(e.target.value)}
              placeholder="Search channel names..."
              className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 py-3 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
            />
          </div>

          {loadingSource ? (
            <div className="py-8 text-center text-slate-400">Loading source list...</div>
          ) : (
            <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1 [scrollbar-width:thin]">
              {filteredSource.slice(0, 200).map((entry, index) => (
                <button
                  key={`${entry.name}-${index}`}
                  type="button"
                  onClick={() => pickFromSource(entry)}
                  className="flex w-full cursor-pointer items-center gap-2 truncate rounded-xl border border-[#8b5cf6]/15 bg-black/25 px-4 py-2.5 text-left text-sm font-semibold text-slate-200 transition hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/10 hover:text-white"
                >
                  <Tv className="h-3.5 w-3.5 shrink-0 text-[#8b5cf6]" />
                  <span className="truncate">{entry.name}</span>
                </button>
              ))}
              {filteredSource.length === 0 && (
                <p className="py-6 text-center text-sm text-slate-400">No matches.</p>
              )}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8"
        >
          <h2 className="mb-4 text-lg font-black text-white">
            {editingId ? "Edit Live TV Channel" : "Add Live TV Channel"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Channel Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Deshi TV"
                className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Stream URL
              </label>
              <input
                type="text"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="https://.../playlist.m3u8"
                className="w-full rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-3 text-xs text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70 focus:ring-2 focus:ring-[#8b5cf6]/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Categories{" "}
                {selectedCategories.length > 0 && (
                  <span className="text-violet-300">
                    ({selectedCategories.length} selected)
                  </span>
                )}
              </label>

              <div className="flex flex-wrap gap-2 rounded-2xl border border-[#8b5cf6]/20 bg-black/35 p-3">
                {categories.map((entry) => {
                  const active = selectedCategories.includes(entry.key);
                  const used = listCountFor(entry.key, editingId);

                  return (
                    <button
                      key={entry.key}
                      type="button"
                      onClick={() => toggleCategory(entry.key)}
                      title={`${used} of ${listLimit} shown on the Live TV page`}
                      className={`cursor-pointer rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                        active
                          ? "border-[#8b5cf6] bg-[#8b5cf6] text-white"
                          : "border-[#8b5cf6]/25 bg-black/30 text-slate-300 hover:border-[#8b5cf6]/60 hover:text-white"
                      }`}
                    >
                      {entry.label}
                      <span
                        className={`ml-1.5 font-black ${
                          used >= listLimit
                            ? "text-rose-300"
                            : active
                              ? "text-white/70"
                              : "text-slate-500"
                        }`}
                      >
                        {used}/{listLimit}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-1.5 text-xs text-slate-400">
                Pick every section this channel belongs to — a news channel
                from Bangladesh can sit in both "বাংলাদেশি চ্যানেল" and "News
                Channels" at once.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                Logo
              </label>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#8b5cf6]/25 bg-black/30">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageUp className="h-5 w-5 text-slate-500" />
                  )}
                </div>

                <input
                  type="file"
                  id="live-tv-logo-input"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <label
                  htmlFor="live-tv-logo-input"
                  className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-4 py-2.5 text-xs font-bold text-violet-200 transition hover:bg-[#8b5cf6]/20"
                >
                  <ImageUp className="h-3.5 w-3.5" />
                  Choose Logo
                </label>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/20 px-4 py-3">
              <input
                type="checkbox"
                checked={showOnList}
                onChange={(e) => setShowOnList(e.target.checked)}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-[#8b5cf6]"
              />
              <span className="text-sm text-slate-200">
                Show on list
                <span className="mt-0.5 block text-xs text-slate-400">
                  Shows this channel directly in its category's row on the Live
                  TV page. Max {listLimit} per category — the rest of the
                  category is still reachable through that row's "View All"
                  page.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/20 px-4 py-3">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-[#8b5cf6]"
              />
              <span className="text-sm text-slate-200">
                Pin to the top
                <span className="mt-0.5 block text-xs text-slate-400">
                  Also shown in the "Pinned Channels" slider right under the
                  player, above every category. Only the first 10 pinned
                  channels are shown there.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#8b5cf6]/15 bg-black/20 px-4 py-3">
              <input
                type="checkbox"
                checked={homeFeatured}
                onChange={(e) => setHomeFeatured(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-[#8b5cf6]"
              />
              <span className="text-sm text-slate-200">Show on the home page</span>
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : editingId ? "Update Channel" : "Create Channel"}
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
          </div>
        </form>
      </div>

      <div className="rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.06] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">
            Managed Live TV Channels {channels.length > 0 && `(${channels.length})`}
          </h2>

          {channels.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b5cf6]" />
                <input
                  type="search"
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  placeholder="Search added channels..."
                  className="w-56 rounded-2xl border border-[#8b5cf6]/20 bg-black/35 py-2.5 pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-500 transition focus:border-[#8b5cf6]/70"
                />
              </div>

              <select
                value={listFilter}
                onChange={(e) => setListFilter(e.target.value)}
                className="cursor-pointer rounded-2xl border border-[#8b5cf6]/20 bg-black/35 px-4 py-2.5 text-xs font-semibold text-white outline-none transition focus:border-[#8b5cf6]/70"
              >
                <option value="all" className="bg-[#1a1030]">
                  All categories ({channels.length})
                </option>
                <option value="pinned" className="bg-[#1a1030]">
                  Pinned only ({pinnedCount})
                </option>
                <option value="onList" className="bg-[#1a1030]">
                  On the Live TV list only (
                  {channels.filter((channel) => channel.showOnList).length})
                </option>
                {categories.map((entry) => (
                  <option key={entry.key} value={entry.key} className="bg-[#1a1030]">
                    {entry.label} (
                    {
                      channels.filter((channel) =>
                        channel.categories?.includes(entry.key),
                      ).length
                    }
                    )
                  </option>
                ))}
                {uncategorizedCount > 0 && (
                  <option value="uncategorized" className="bg-[#1a1030]">
                    Uncategorized ({uncategorizedCount})
                  </option>
                )}
              </select>
            </div>
          )}
        </div>

        {uncategorizedCount > 0 && (
          <p className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-xs text-amber-200">
            {uncategorizedCount} channel{uncategorizedCount > 1 ? "s were" : " was"}{" "}
            added before categories existed and {uncategorizedCount > 1 ? "are" : "is"}{" "}
            grouped under "Other Channels" on the client. Edit{" "}
            {uncategorizedCount > 1 ? "them" : "it"} to pick a category.
          </p>
        )}

        {loadingChannels ? (
          <div className="py-10 text-center text-slate-400">Loading...</div>
        ) : channels.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            No Live TV channels yet — add one above.
          </div>
        ) : listedChannels.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            {channelQuery
              ? `No added channel matches "${channelSearch.trim()}".`
              : "No channels in this category yet."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {listedChannels.map((channel) => {
              const id = channel._id || channel.id;

              return (
                <div
                  key={id}
                  className="flex flex-col gap-2 overflow-hidden rounded-2xl border border-[#8b5cf6]/15 bg-black/30 p-2.5"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-black/40">
                    <img
                      src={`${base}${channel.logo}`}
                      alt={channel.name}
                      className="h-full w-full object-cover"
                    />
                    {channel.pinned && (
                      <span
                        title="Pinned to the top of the Live TV page"
                        className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8b5cf6]/90 text-white"
                      >
                        <Pin className="h-3 w-3" />
                      </span>
                    )}
                    {channel.showOnList && (
                      <span
                        title="Shown directly in its category's row"
                        className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/90 text-white"
                      >
                        <ListChecks className="h-3 w-3" />
                      </span>
                    )}
                    {channel.homeFeatured && (
                      <span
                        title="Shown on the home page"
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/90 text-white"
                      >
                        <HomeIcon className="h-3 w-3" />
                      </span>
                    )}
                  </div>

                  <p className="truncate text-center text-xs font-semibold text-white">
                    {channel.name}
                  </p>

                  <p
                    title={channelCategoryLabels(channel)}
                    className={`truncate text-center text-[10px] font-semibold ${
                      channel.categories?.length ? "text-violet-300" : "text-amber-300"
                    }`}
                  >
                    {channelCategoryLabels(channel)}
                  </p>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(channel)}
                      className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-[#8b5cf6]/15 px-2 py-1.5 text-violet-200 transition hover:bg-[#8b5cf6]/25"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(channel)}
                      disabled={deletingId === id}
                      className="flex flex-1 cursor-pointer items-center justify-center rounded-lg bg-rose-500/15 px-2 py-1.5 text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-60"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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

export default LiveTvManager;
