import React from "react";
import { Mail, MessageCircle } from "lucide-react";
import { FaFacebookF, FaYoutube } from "react-icons/fa";

import StaticPage from "../../components/StaticPage/StaticPage";

const ContactUs = () => (
  <StaticPage title="Contact Us" subtitle="We're happy to help.">
    <p>
      Have a question about your account, a video, or O-TV in general? Reach
      out through any of the channels below and our team will get back to
      you as soon as possible.
    </p>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <a
        href="mailto:support@otv.com"
        className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-[#16d6dc]/40 hover:bg-white/[0.06]"
      >
        <Mail className="mt-0.5 h-6 w-6 shrink-0 text-[#16d6dc]" />
        <div>
          <p className="font-semibold text-white">Email</p>
          <p className="mt-1 text-sm text-slate-400">support@otv.com</p>
        </div>
      </a>

      <a
        href="/feedback"
        className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-[#16d6dc]/40 hover:bg-white/[0.06]"
      >
        <MessageCircle className="mt-0.5 h-6 w-6 shrink-0 text-[#16d6dc]" />
        <div>
          <p className="font-semibold text-white">Feedback</p>
          <p className="mt-1 text-sm text-slate-400">
            Share an idea or report a problem
          </p>
        </div>
      </a>
    </div>

    <section>
      <h2 className="text-lg font-bold text-white">Follow us</h2>
      <div className="mt-3 flex items-center gap-3">
        <a
          href="https://www.facebook.com/"
          target="_blank"
          rel="noreferrer"
          aria-label="O-TV on Facebook"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] text-white transition hover:bg-[#1877f2]"
        >
          <FaFacebookF size={18} />
        </a>
        <a
          href="https://www.youtube.com/"
          target="_blank"
          rel="noreferrer"
          aria-label="O-TV on YouTube"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] text-white transition hover:bg-[#ff0000]"
        >
          <FaYoutube size={18} />
        </a>
      </div>
    </section>

    <p className="text-xs text-slate-500">
      We typically respond within 1–2 business days.
    </p>
  </StaticPage>
);

export default ContactUs;
