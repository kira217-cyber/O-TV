import React from "react";

const FAQ_ITEMS = [
  {
    q: "What is O-TV?",
    a: "O-TV is a streaming platform for movies, natok, sports, Live TV channels, and short-form videos, along with content from independent creators through Creator Channels.",
  },
  {
    q: "Do I need an account to watch content?",
    a: "You can browse and watch most content without an account. Creating an account lets you access personalized features and, for creators, upload and manage videos.",
  },
  {
    q: "How do I watch Live TV?",
    a: "Open the Live TV tab from the navigation menu. Select any channel to start watching instantly — the channel plays automatically and you can browse other channels from the grid below the player.",
  },
  {
    q: "How does Creator Channels work?",
    a: "Creator Channels lets independent studios and creators upload their own videos to O-TV. Uploaded videos are reviewed before going live. Visit the Creator Channels page to browse all channels on the platform.",
  },
  {
    q: "Why do I see ads while watching?",
    a: "O-TV shows occasional in-player video or image ads to help keep the platform free to use. Video ads can be skipped after a few seconds, and image ads never interrupt playback.",
  },
  {
    q: "I found a bug or have a suggestion — where do I report it?",
    a: "Please use the Feedback page to let us know. We review all submissions and use them to improve O-TV.",
  },
  {
    q: "How can I become a creator on O-TV?",
    a: "Register for a Studio/Creator account, set up your channel, and start uploading. Each video goes through a quick review before it's published.",
  },
];

const Faq = () => (
  <div className="mx-auto w-full max-w-4xl px-4 pb-16 pt-6 text-white sm:px-6 lg:px-10">
    <h1 className="text-2xl font-bold text-white sm:text-3xl">
      Frequently Asked Questions
    </h1>
    <p className="mt-2 text-sm text-slate-400">
      Answers to common questions about using O-TV.
    </p>

    <div className="mt-8 space-y-3">
      {FAQ_ITEMS.map((item) => (
        <details
          key={item.q}
          className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 open:border-[#16d6dc]/40"
        >
          <summary className="cursor-pointer list-none text-sm font-semibold text-white marker:content-none sm:text-[15px]">
            <span className="flex items-center justify-between gap-3">
              {item.q}
              <span className="shrink-0 text-[#16d6dc] transition group-open:rotate-45">
                +
              </span>
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.a}</p>
        </details>
      ))}
    </div>
  </div>
);

export default Faq;
