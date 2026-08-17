import React from "react";
import { useNavigate } from "react-router";
import { Home } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0e0f] px-4 text-center text-white">
      <div>
        <h1 className="bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-6xl font-black text-transparent">
          404
        </h1>
        <p className="mt-4 text-lg font-semibold">Page Not Found</p>
        <p className="mt-2 text-sm text-slate-400">
          The page you're looking for doesn't exist in Pipra-TV Studio.
        </p>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] px-6 py-3 text-sm font-black text-black transition hover:scale-[1.02]"
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
