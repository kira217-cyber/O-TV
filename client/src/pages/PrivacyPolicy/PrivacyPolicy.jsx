import React from "react";

import StaticPage from "../../components/StaticPage/StaticPage";

const PrivacyPolicy = () => (
  <StaticPage title="Privacy Policy" subtitle="Last updated: 2026">
    <p>
      This Privacy Policy explains what information O-TV collects, how we use
      it, and the choices you have. By using O-TV, you agree to the
      collection and use of information as described here.
    </p>

    <section>
      <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          <span className="font-semibold text-white">Account information</span>{" "}
          — name, email or phone number, and password, provided when you
          register.
        </li>
        <li>
          <span className="font-semibold text-white">Usage data</span> —
          videos watched, watch history, search queries, and general app
          interactions, used to improve recommendations and site performance.
        </li>
        <li>
          <span className="font-semibold text-white">Device information</span>{" "}
          — browser type, device type, and approximate location, used for
          security and compatibility purposes.
        </li>
        <li>
          <span className="font-semibold text-white">Creator/uploader data</span>{" "}
          — for Creator Channel accounts, channel details and uploaded video
          metadata.
        </li>
      </ul>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">2. How We Use Information</h2>
      <p className="mt-2">We use collected information to:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Operate, maintain, and improve the O-TV Service.</li>
        <li>Personalize content and recommendations.</li>
        <li>Process deposits, withdrawals, and account-related requests.</li>
        <li>Detect, prevent, and address fraud, abuse, and security issues.</li>
        <li>Communicate important updates about your account or the Service.</li>
      </ul>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">3. Cookies &amp; Local Storage</h2>
      <p className="mt-2">
        O-TV uses cookies and browser local storage to keep you signed in,
        remember your preferences, and understand how the Service is used.
        You can control cookies through your browser settings, though some
        features may not function correctly without them.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">4. Sharing of Information</h2>
      <p className="mt-2">
        We do not sell your personal information. We may share limited data
        with trusted service providers (such as hosting and payment
        processing partners) strictly to operate the Service, or when
        required by law.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">5. Data Security</h2>
      <p className="mt-2">
        We use reasonable technical and organizational measures to protect
        your information. However, no method of transmission or storage is
        completely secure, and we cannot guarantee absolute security.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">6. Your Choices</h2>
      <p className="mt-2">
        You may update your account information at any time from your
        profile settings. You may also contact us to request access to,
        correction of, or deletion of your personal data, subject to
        applicable legal requirements.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">7. Children's Privacy</h2>
      <p className="mt-2">
        O-TV is not directed at children under 13, and we do not knowingly
        collect personal information from children under that age.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">8. Changes to This Policy</h2>
      <p className="mt-2">
        We may update this Privacy Policy periodically. Material changes will
        be reflected by updating the "Last updated" date above.
      </p>
    </section>

    <section>
      <h2 className="text-lg font-bold text-white">9. Contact Us</h2>
      <p className="mt-2">
        For privacy-related questions or requests, please reach out via our{" "}
        <a href="/contact-us" className="text-[#16d6dc] hover:underline">
          Contact Us
        </a>{" "}
        page.
      </p>
    </section>
  </StaticPage>
);

export default PrivacyPolicy;
