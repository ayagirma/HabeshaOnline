import Link from "next/link";

export const metadata = { title: "Privacy — HabeshaOnline" };

/* Plain-language privacy notice. Have a lawyer review before launch and
   fill in the real contact email. */
export default function PrivacyPage() {
  return (
    <main id="main">
      <Link className="back" href="/">
        ← Back
      </Link>
      <div className="legal">
        <h2>Privacy</h2>
        <p className="updated">Last updated: September 2026</p>

        <p>
          This explains what HabeshaOnline collects, why, and what&rsquo;s shown to other people.
        </p>

        <h3>What we collect</h3>
        <ul>
          <li><strong>Your email and password.</strong> The password is hashed by our auth provider before it&rsquo;s stored — we never see or store it in readable form.</li>
          <li><strong>Your user name and display name</strong>, and an optional phone number or email you can add as a contact.</li>
          <li><strong>Your listings</strong> — their text, prices, and any photos you upload.</li>
          <li><strong>Messages buyers send you</strong>, including the name and contact they enter.</li>
          <li><strong>Basic technical logs</strong> — the kind any website keeps to run and to stop abuse.</li>
        </ul>

        <h3>What&rsquo;s public</h3>
        <ul>
          <li>Your <strong>display name and city</strong> appear on your listings.</li>
          <li>Your <strong>phone or email shows only if you turn on &ldquo;Show contact&rdquo;</strong> in your account. It&rsquo;s off by default.</li>
          <li>Your listing content is public once approved.</li>
          <li>Your <strong>login email is never shown</strong> to anyone.</li>
        </ul>

        <h3>How we use it</h3>
        <p>
          To run the marketplace: show listings, let buyers reach you, confirm your email, review
          content, and prevent spam and abuse. We don&rsquo;t sell your data or use it for
          advertising.
        </p>

        <h3>Who we share it with</h3>
        <p>Service providers that help run the site, and only for that purpose:</p>
        <ul>
          <li><strong>Supabase</strong> — database, accounts, and file storage.</li>
          <li>Our <strong>email provider</strong> — to send you confirmation and notification emails.</li>
          <li><strong>Vercel</strong> — website hosting.</li>
        </ul>
        <p>
          When you message a seller, your name and contact go to that seller so they can reply.
        </p>

        <h3>Your choices</h3>
        <ul>
          <li>Edit your display name, contact, and visibility any time on your account page.</li>
          <li>Delete any of your listings any time.</li>
          <li>Email us to close your account and remove your personal data.</li>
        </ul>

        <h3>What stays in your browser</h3>
        <p>
          A sign-in cookie keeps you logged in. Your language choice and saved listings are stored
          locally in your browser — they don&rsquo;t leave your device.
        </p>

        <h3>Keeping and removing data</h3>
        <p>
          We keep your data while your account is active. Removed listings and resolved messages may
          be kept for a while as records.
        </p>

        <h3>Changes and contact</h3>
        <p>
          We may update this notice; the date above changes when we do. Questions:{" "}
          <a href="mailto:hello@habeshaonline.com">hello@habeshaonline.com</a>.
        </p>
      </div>
    </main>
  );
}
