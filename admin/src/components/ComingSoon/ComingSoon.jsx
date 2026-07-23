import React from "react";
import { Construction } from "lucide-react";

const ComingSoon = ({ title, description }) => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center rounded-[28px] border border-[#8b5cf6]/20 bg-white/[0.04] p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c4b5fd] via-[#8b5cf6] to-[#4338ca] shadow-lg shadow-[#8b5cf6]/30">
        <Construction className="h-8 w-8 text-white" />
      </div>

      <h1 className="bg-gradient-to-r from-[#c4b5fd] via-[#8b5cf6] to-[#a855f7] bg-clip-text text-2xl font-black text-transparent md:text-3xl">
        {title}
      </h1>

      <p className="mt-3 max-w-md text-sm text-slate-400">
        {description ||
          "এই সেকশনের ব্যাকএন্ড API এখনো যুক্ত করা হয়নি। এই পেজ প্রস্তুত আছে, ডেটা সংযুক্ত হলেই কাজ শুরু করবে।"}
      </p>
    </div>
  );
};

export default ComingSoon;
