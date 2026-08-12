import React from "react";

import StaticPage from "../../components/StaticPage/StaticPage";

const TermsOfUse = () => (
  <StaticPage title="Terms of Use" subtitle="Last updated: 2026">
    <p>
      Welcome to O-TV. These Terms of Use ("Terms") govern your access to and
      use of the O-TV website, mobile experience, and all related services
      (collectively, the "Service"). By creating an account, browsing, or
      streaming any content on O-TV, you agree to be bound by these Terms. If
      you do not agree, please do not use the Service.
    </p>

    <section>
      <h2 className="text-lg font-bold text-white">1. The Service</h2>
      <p className="mt-2">
        O-TV is a video streaming platform that hosts movies, natok, sports
        content, Live TV channels, and short-form videos, along with content
        uploaded by independent creators through Creator Channels. Content
        availability may change over time and may vary based on your account
        status.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">2. Accounts</h2>
      <p className="mt-2">
        You must provide accurate information when creating an account and
        are responsible for keeping your login credentials secure. You are
        responsible for all activity that happens under your account. Notify
        us immediately if you suspect unauthorized use of your account.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">3. Creator Channels</h2>
      <p className="mt-2">
        Studio/creator accounts may upload videos for publication on O-TV.
        Uploaded content is reviewed before it becomes publicly visible.
        Creators are solely responsible for ensuring they have the rights to
        any content they upload, and O-TV may reject, remove, or suspend
        content that violates these Terms or applicable law.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">4. Acceptable Use</h2>
      <p className="mt-2">You agree not to:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Upload or share content you do not have the rights to distribute.</li>
        <li>Use the Service for any unlawful, harmful, or abusive purpose.</li>
        <li>Attempt to circumvent any access, security, or content-protection measures.</li>
        <li>Scrape, copy, or redistribute O-TV content without permission.</li>
        <li>Interfere with the normal operation of the Service for other users.</li>
      </ul>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">5. Advertising</h2>
      <p className="mt-2">
        O-TV may display in-player advertising (video or image overlays)
        during video and Live TV playback as part of how the Service is
        funded. Ad content is reviewed by our team, but O-TV is not
        responsible for the content of third-party websites linked from
        advertisements.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">6. Intellectual Property</h2>
      <p className="mt-2">
        All O-TV branding, design, and platform software is the property of
        O-TV. Content uploaded by creators remains the property of the
        respective rights holders and is made available on O-TV under
        license for streaming purposes only.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">7. Termination</h2>
      <p className="mt-2">
        We may suspend or terminate access to the Service for any account
        that violates these Terms, without prior notice, at our discretion.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">8. Changes to These Terms</h2>
      <p className="mt-2">
        We may update these Terms from time to time. Continued use of the
        Service after changes are posted constitutes acceptance of the
        revised Terms.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">9. Contact</h2>
      <p className="mt-2">
        Questions about these Terms can be sent through our{" "}
        <a href="/contact-us" className="text-[#16d6dc] hover:underline">
          Contact Us
        </a>{" "}
        page.
      </p>
    </section>
  </StaticPage>
);

export default TermsOfUse;
