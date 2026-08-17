import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, ListVideo } from "lucide-react";

import { privateApi } from "../../api/privateAxios";
import { logout } from "../../features/privateAuth/privateAuthSlice";
import { selectPrivateUser } from "../../features/privateAuth/privateAuthSelectors";
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";
import PrivateHeader from "../../components/PrivateHeader/PrivateHeader";

const PrivateVideo = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectPrivateUser);
  const base = privateApi.defaults.baseURL;

  const [playlists, setPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        setLoadingPlaylists(true);
        const { data } = await privateApi.get("/api/private/playlists");
        setPlaylists(data?.data?.playlists || []);
      } catch {
        setPlaylists([]);
      } finally {
        setLoadingPlaylists(false);
      }
    };

    loadPlaylists();
  }, []);

  const openPlaylist = async (playlist) => {
    const id = playlist._id || playlist.id;
    setSelectedPlaylist(playlist);
    setActiveVideo(null);

    try {
      setLoadingVideos(true);
      const { data } = await privateApi.get(`/api/private/playlists/${id}/videos`);
      const loaded = data?.data?.videos || [];
      setVideos(loaded);
      setActiveVideo(loaded[0] || null);
    } catch {
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  };

  const backToPlaylists = () => {
    setSelectedPlaylist(null);
    setVideos([]);
    setActiveVideo(null);
  };

  return (
    <div className="min-h-screen">
      <PrivateHeader userEmail={user?.email} onLogout={() => dispatch(logout())} />

      <div className="player-frame mx-auto w-full max-w-[1680px] px-4 pb-16 pt-6 text-white sm:px-6 lg:px-10 xl:px-[42px]">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          {selectedPlaylist ? (
            <button
              type="button"
              onClick={backToPlaylists}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#16d6dc]/20 bg-black/30 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-[#16d6dc]/50 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Playlists
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <ListVideo className="h-5 w-5 text-[#16d6dc]" />
              <h1 className="text-xl font-bold text-white sm:text-2xl">Your Playlists</h1>
            </div>
          )}
        </div>

        {!selectedPlaylist && (
          <>
            {loadingPlaylists ? (
              <div className="py-16 text-center text-slate-400">Loading...</div>
            ) : playlists.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                No playlists have been assigned to your account yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:grid-cols-6">
                {playlists.map((playlist) => {
                  const id = playlist._id || playlist.id;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => openPlaylist(playlist)}
                      className="group flex cursor-pointer flex-col items-center gap-3 rounded-2xl border border-[#16d6dc]/15 bg-black/25 p-4 text-center transition hover:border-[#16d6dc]/50 hover:bg-[#16d6dc]/5"
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-xl bg-black/40">
                        <img
                          src={`${base}${playlist.logo}`}
                          alt={playlist.title}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </div>
                      <p className="truncate text-sm font-semibold text-white">{playlist.title}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {selectedPlaylist && (
          <>
            {loadingVideos ? (
              <div className="py-16 text-center text-slate-400">Loading...</div>
            ) : videos.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                This playlist has no videos yet.
              </div>
            ) : (
              <>
                {activeVideo && (
                  <div className="pt-1">
                    <VideoPlayer
                      src={activeVideo.video?.url}
                      poster={`${base}${activeVideo.thumbnail}`}
                      title={activeVideo.title}
                    />

                    <h2 className="mt-5 text-xl font-bold text-white sm:text-2xl">
                      {activeVideo.title}
                    </h2>
                    {activeVideo.shortDescription && (
                      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
                        {activeVideo.shortDescription}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-10">
                  <h3 className="mb-4 text-lg font-semibold text-white">
                    {selectedPlaylist.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {videos.map((video) => {
                      const id = video._id || video.id;
                      const activeId = activeVideo?._id || activeVideo?.id;
                      const isActive = id === activeId;

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setActiveVideo(video)}
                          className="group block cursor-pointer text-left"
                        >
                          <div
                            className={`aspect-video w-full overflow-hidden rounded-[10px] border bg-[#182023] ${
                              isActive ? "border-[#16d6dc]/70" : "border-white/10"
                            }`}
                          >
                            <img
                              src={`${base}${video.thumbnail}`}
                              alt={video.title}
                              className="h-full w-full select-none object-cover transition group-hover:scale-105"
                            />
                          </div>
                          <p
                            className={`mt-2 truncate text-xs font-semibold group-hover:text-white ${
                              isActive ? "text-[#5eeaf2]" : "text-[#c9cdcf]"
                            }`}
                          >
                            {video.title}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PrivateVideo;
