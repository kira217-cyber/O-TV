import React from "react";
import { Link } from "react-router";
import { AlertTriangle } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0e0f] px-4 text-center text-white">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-[#a855f7]/30 bg-[#a855f7]/10">
        <AlertTriangle className="h-10 w-10 text-[#a855f7]" />
      </div>

      <h1 className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-5xl font-black text-transparent">
        404
      </h1>

      <p className="mt-3 text-lg text-slate-300">পেজটি খুঁজে পাওয়া যায়নি</p>

      <Link
        to="/"
        className="mt-8 rounded-2xl bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#8b5cf6]/30 transition hover:scale-[1.02]"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
