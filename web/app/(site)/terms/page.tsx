import Link from "next/link";

export const metadata = { title: "Terms of Use — HabeshaOnline" };

/* Plain-language terms for a small community marketplace. Written to be
   read, not to be exhaustive — have a lawyer look it over before launch,
   and fill in the real contact email. */
export default function TermsPage() {
  return (
    <main id="main">
      <Link className="back" href="/">
        ← Back
      </Link>
      <div className="legal">
        <h2>Terms of Use</h2>
        <p className="updated">Last updated: September 2026</p>

        <p>
          HabeshaOnline is a community marketplace for the Ethiopian and Eritrean community in
          Colorado. By using the site or creating an account, you agree to these terms.
        </p>

        <h3>Your account</h3>
        <ul>
          <li>You need an account to post a listing. You confirm your email with a code we send you.</li>
          <li>One account per person. Keep your password to yourself — you&rsquo;re responsible for what happens under your account.</li>
          <li>You must be 18 or older to have an account.</li>
        </ul>

        <h3>What you post</h3>
        <p>You are responsible for everything in your listings and messages. Listings must be:</p>
        <ul>
          <li><strong>Accurate</strong> — real items, real prices, real availability.</li>
          <li><strong>Yours to offer</strong> — you own it, or you&rsquo;re authorized to rent, sell, or provide it.</li>
          <li><strong>Legal</strong> — no weapons, drugs, stolen or counterfeit goods, adult services, or anything prohibited under Colorado or U.S. law.</li>
          <li><strong>Not spam</strong> — no duplicate posts, no misleading titles, no bait.</li>
        </ul>

        <h3>Answering buyers</h3>
        <p>
          When someone messages you about a listing, you agree to reply within{" "}
          <strong>3 business days</strong> — a yes, a no, or &ldquo;sold&rdquo; is enough. Listings
          left unanswered are treated as no longer wanted and taken down, so buyers aren&rsquo;t left
          waiting.
        </p>

        <h3>Moderation</h3>
        <p>
          New listings are reviewed before they go live. We may remove any listing, and suspend or
          block any account, at our discretion — especially for anything above. We don&rsquo;t owe an
          explanation, but we&rsquo;ll usually give one.
        </p>

        <h3>Contact between buyers and sellers</h3>
        <p>
          Buyers reach you through the message form. You choose whether to also show your phone or
          email on your listings. Anything that happens in contact off the site — calls, texts,
          meetings, payments — is between you and the other person. We&rsquo;re not part of it.
        </p>

        <h3>Paid plans</h3>
        <p>
          Paid listing plans are billed by sending the fee through Cash App or Zelle, which we
          confirm by hand. Fees are non-refundable once a listing is live. We do not process,
          hold, or guarantee any payment between a buyer and a seller — those are always direct.
        </p>

        <h3>No warranty, no liability</h3>
        <p>
          Listings are content posted by users. We don&rsquo;t verify items, sellers, or buyers, and
          we&rsquo;re not a party to any transaction. Meet in public, in daylight, and look at what
          you&rsquo;re buying before you pay. To the fullest extent allowed by law, HabeshaOnline is
          not liable for any dispute, loss, or damage arising from use of the site or from any deal
          made through it.
        </p>

        <h3>Ending your use</h3>
        <p>
          You can stop using the site any time and delete your listings from your account. We can
          suspend or close an account that breaks these terms.
        </p>

        <h3>Changes</h3>
        <p>
          We may update these terms. Continued use after a change means you accept it. These terms
          are governed by the laws of the State of Colorado, USA.
        </p>

        <h3>Contact</h3>
        <p>
          Questions about these terms: <a href="mailto:hello@habeshaonline.com">hello@habeshaonline.com</a>.
        </p>
      </div>
    </main>
  );
}
