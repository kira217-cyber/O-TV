import React from "react";
import { Construction } from "lucide-react";

const ComingSoon = ({ title, description }) => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center rounded-[28px] border border-[#f59e0b]/20 bg-white/[0.04] p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fde68a] via-[#f59e0b] to-[#b45309] shadow-lg shadow-[#f59e0b]/30">
        <Construction className="h-8 w-8 text-black" />
      </div>

      <h1 className="bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#b45309] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
        {title}
      </h1>

      <p className="mt-3 max-w-md text-sm text-slate-400">
        {description ||
          "This feature is coming soon. Video upload and approval workflows will be available here shortly."}
      </p>
    </div>
  );
};

export default ComingSoon;
