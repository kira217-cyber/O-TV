import React from "react";
import { Lock, LogOut } from "lucide-react";

// Shared top bar for the whole private-video section (/private-video,
// /private-user-login) — deliberately its own small brand mark, not the
// site's Navber, since this section intentionally has no Pipra-TV chrome
// around it (see RootLayout's isPrivatePage branch).
const PrivateHeader = ({ userEmail, onLogout }) => (
  <header className="sticky top-0 z-30 border-b border-[#16d6dc]/15 bg-[#0b0f10]/95 backdrop-blur-md">
    <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5eeaf2] via-[#16d6dc] to-[#0e7a90] shadow-[0_0_25px_rgba(22,214,220,0.35)]">
          <Lock className="h-4 w-4 text-black" />
        </span>
        <span className="truncate text-base font-bold text-white sm:text-lg">
          Private Access
        </span>
      </div>

      {onLogout && (
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {userEmail && (
            <span className="hidden max-w-[220px] truncate text-xs text-slate-400 sm:inline">
              {userEmail}
            </span>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#16d6dc]/20 bg-black/30 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-red-500/50 hover:text-red-300 sm:px-4 sm:py-2.5 sm:text-sm"
          >
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </div>
  </header>
);

export default PrivateHeader;
