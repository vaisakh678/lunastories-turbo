import type { Metadata } from "next";
import { LegalPage } from "../_components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Luna Stories",
  description:
    "How Luna Stories collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="May 27, 2026">
      <p>
        Luna Stories (&quot;Luna Stories,&quot; &quot;we,&quot; &quot;us&quot;) is built by Cortex Lumora.
        This policy explains what we collect when you use our iOS app and this
        website, why we collect it, and the choices you have. We&apos;ve tried to
        keep it short and plain.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account details</strong> — your email address and, if you
          choose social sign-in, the basic profile your provider shares (name,
          avatar). Authentication is handled by Clerk.
        </li>
        <li>
          <strong>Children and characters you create</strong> — the names,
          ages, and traits you enter so we can personalize the stories. You
          can edit or delete these at any time from the app.
        </li>
        <li>
          <strong>Stories and preferences</strong> — the worlds, morals, and
          settings you pick, plus the generated stories themselves so you can
          revisit them.
        </li>
        <li>
          <strong>Subscription status</strong> — handled by Apple and
          RevenueCat. We receive whether you have an active subscription; we
          never see your payment details.
        </li>
        <li>
          <strong>Usage and diagnostics</strong> — crash reports and product
          analytics events (which screens and features you open, taps, and
          session timing), together with device and app details such as device
          model, operating system, app version, and an approximate location
          inferred from your IP address. We use this to fix bugs and understand
          how the app is used. We don&apos;t use it to build advertising
          profiles, and we don&apos;t use it to profile children.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To generate personalized stories and audio narration for you.</li>
        <li>To keep your library in sync across devices when you sign in.</li>
        <li>To send you the bedtime reminders you opt into.</li>
        <li>To process subscriptions, support requests, and account deletions.</li>
        <li>To keep the app stable and secure.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We share data with the service providers that make the app work:
        Clerk (auth), OpenAI (story and voice generation), Cloudflare and AWS
        (hosting and storage), RevenueCat and Apple (subscriptions), OneSignal
        (push notifications), and PostHog (product analytics). We don&apos;t
        sell your data and we don&apos;t use it to train external advertising
        models.
      </p>

      <h2>Children&apos;s information</h2>
      <p>
        Luna Stories is designed for parents and guardians to use with their
        children. Accounts are for adults; the child names and details you
        enter are personalization inputs that belong to your account. We don&apos;t
        knowingly create accounts for children under 13, and we don&apos;t serve
        ads.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>
          Edit or delete characters, stories, and reminders from the app at
          any time.
        </li>
        <li>
          Delete your entire account from <strong>Settings → Delete Account</strong>.
          This permanently removes your profile, characters, and stories.
        </li>
        <li>
          Manage your subscription from your Apple ID&apos;s Subscriptions
          settings.
        </li>
      </ul>

      <h2>Retention</h2>
      <p>
        We keep your data while your account is active. When you delete your
        account, we remove your data within 30 days, except where we&apos;re
        legally required to keep records (for example, payment receipts).
      </p>

      <h2>Contact</h2>
      <p>
        Questions or requests? Email{" "}
        <a href="mailto:cortexlumora@gmail.com">cortexlumora@gmail.com</a> and
        we&apos;ll respond.
      </p>
    </LegalPage>
  );
}
