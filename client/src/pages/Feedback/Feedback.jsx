import React from "react";
import { MessageSquareHeart } from "lucide-react";

import StaticPage from "../../components/StaticPage/StaticPage";

const Feedback = () => (
  <StaticPage
    title="Feedback"
    subtitle="Help us make Pipra-TV better."
  >
    <div className="flex items-start gap-4 rounded-2xl border border-[#16d6dc]/20 bg-[#16d6dc]/[0.06] p-5">
      <MessageSquareHeart className="mt-0.5 h-6 w-6 shrink-0 text-[#16d6dc]" />
      <p>
        We build Pipra-TV around what our viewers and creators actually need.
        Whether it's a feature you'd like to see, content you think is
        missing, or something that felt confusing to use — we want to hear
        about it.
      </p>
    </div>

    <section>
      <h2 className="text-lg font-bold text-white">What kind of feedback helps most</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Features you wish Pipra-TV had, and why they'd matter to you.</li>
        <li>Content categories or genres you'd like to see more of.</li>
        <li>Anything about playback, navigation, or design that felt awkward.</li>
        <li>What you enjoy — so we know what to keep doing.</li>
      </ul>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">Found a bug instead?</h2>
      <p className="mt-2">
        If something is broken rather than just an idea for improvement,
        please include what you were doing, what you expected to happen, and
        what happened instead — that context helps us fix it faster.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">Send it to us</h2>
      <p className="mt-2">
        Reach us through the details on our{" "}
        <a href="/contact-us" className="text-[#16d6dc] hover:underline">
          Contact Us
        </a>{" "}
        page. We read every message.
      </p>
    </section>
  </StaticPage>
);

export default Feedback;
