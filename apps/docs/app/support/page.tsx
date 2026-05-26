import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Support — Luna Stories",
  description:
    "Get help with Luna Stories — contact us, manage your subscription, or delete your account.",
};

export default function SupportPage() {
  return (
    <LegalPage title="Support" eyebrow="Support" updated="May 27, 2026">
      <p>
        Need a hand with Luna Stories? We&apos;re happy to help. Email us at{" "}
        <a href="mailto:cortexlumora@gmail.com">cortexlumora@gmail.com</a> and
        we&apos;ll get back to you, usually within two business days. It helps
        to include your device model, iOS version, and a short description of
        what happened.
      </p>

      <h2>Frequently asked questions</h2>
      <ul>
        <li>
          <strong>How do I create a story?</strong> Add your child and any
          friends or animal characters on the home screen, pick a story world,
          then tap <strong>Start</strong>. Luna writes and narrates a brand-new
          story in moments.
        </li>
        <li>
          <strong>Why isn&apos;t my story generating?</strong> Story creation
          needs an internet connection. If it stalls, check your connection,
          close and reopen the app, and try again. If it keeps failing, email
          us.
        </li>
        <li>
          <strong>Can I edit or remove a character?</strong> Yes — tap and hold
          (or use the edit option on) any character to change its details, or
          delete it. Stories you&apos;ve already created stay in your library.
        </li>
        <li>
          <strong>Is Luna Stories safe for children?</strong> Accounts are for
          parents and guardians. You choose who appears in the stories, the
          content is gentle and age-appropriate, and there are no ads.
        </li>
      </ul>

      <h2>Managing your subscription</h2>
      <p>
        Subscriptions are billed through your Apple ID. To view, change, or
        cancel your plan, open the iOS <strong>Settings</strong> app, tap your
        name at the top, then <strong>Subscriptions</strong>, and select Luna
        Stories. Cancelling stops future renewals; you keep access until the
        end of the current period.
      </p>

      <h2>Deleting your account</h2>
      <p>
        You can permanently delete your account from within the app at{" "}
        <strong>Settings → Delete Account</strong>. This removes your profile,
        characters, and stories. If you can&apos;t access the app, email{" "}
        <a href="mailto:cortexlumora@gmail.com">cortexlumora@gmail.com</a> from
        the address on your account and we&apos;ll take care of it.
      </p>

      <h2>Privacy &amp; terms</h2>
      <p>
        For details on how we handle your information, see our{" "}
        <a href="/privacy">Privacy Policy</a> and{" "}
        <a href="/terms">Terms of Use</a>.
      </p>

      <h2>Still need help?</h2>
      <p>
        Reach us anytime at{" "}
        <a href="mailto:cortexlumora@gmail.com">cortexlumora@gmail.com</a>.
        We&apos;re a small team and we read every message.
      </p>
    </LegalPage>
  );
}
