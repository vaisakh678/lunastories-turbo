import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="Luna Stories"
              width={36}
              height={36}
              className="rounded-lg shadow-sm ring-1 ring-white/10"
            />
            <span className="font-display text-xl font-bold text-foreground">
              Luna Stories
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-ink-soft hover:text-foreground transition"
          >
            ← Back home
          </Link>
        </div>
      </header>

      <main className="bg-aurora relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28 flex-1">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            Legal
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold leading-tight">
            {title}
          </h1>
          <p className="mt-4 text-sm text-ink-mute">Last updated: {updated}</p>

          <article className="mt-10 space-y-6 text-ink-soft leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-foreground">
            {children}
          </article>
        </div>
      </main>

      <footer className="bg-background border-t border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Image src="/icon.png" alt="" width={28} height={28} className="rounded-md" />
            <span className="font-display font-bold">Luna Stories</span>
            <span className="text-sm text-ink-soft ml-2">
              © {new Date().getFullYear()}
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-ink-soft">
            <Link href="/privacy" className="hover:text-foreground transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition">
              Terms
            </Link>
            <a
              href="mailto:cortexlumora@gmail.com"
              className="hover:text-foreground transition"
            >
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
