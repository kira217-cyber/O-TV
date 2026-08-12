import React from "react";

const StaticPage = ({ title, subtitle, children }) => (
  <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6 text-white sm:px-6 lg:px-10">
    <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
    {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}

    <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-300 sm:text-[15px]">
      {children}
    </div>
  </div>
);

export default StaticPage;
