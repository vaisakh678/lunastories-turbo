import Image from "next/image";

const MODES = [
  { slug: "alice_in_wonderland", title: "Alice in Wonderland", blurb: "Tumble down the rabbit hole." },
  { slug: "wizard_of_oz", title: "Wizard of Oz", blurb: "Follow the yellow brick road." },
  { slug: "jungle_book", title: "Jungle Book", blurb: "Run wild with the pack." },
  { slug: "grimms_tales", title: "Grimm's Tales", blurb: "Castles, witches, happy endings." },
  { slug: "inventors", title: "Inventors", blurb: "Meet the great minds of science." },
  { slug: "construction_site", title: "Construction Site", blurb: "Big trucks, bigger ideas." },
  { slug: "vegetables", title: "Vegetable Patch", blurb: "Crunchy heroes save the day." },
  { slug: "environment", title: "Save the Planet", blurb: "Tiny heroes, huge impact." },
  { slug: "creative", title: "Create your own", blurb: "You pick everything." },
];

const TYPES = [
  "dragon",
  "unicorn",
  "fairy",
  "robot",
  "fox",
  "dinosaur",
  "elf",
  "dolphin",
];

const BENEFITS = [
  {
    title: "Your child is the hero",
    body: "Every story is written around your child's name, age, and the people they love.",
  },
  {
    title: "Lessons that stick",
    body: "Pick a moral — kindness, honesty, courage — and Milo weaves it into the story.",
  },
  {
    title: "Never the same twice",
    body: "Fresh adventures every night. No more reading the same picture book for the 40th time.",
  },
  {
    title: "Built for bedtime",
    body: "Calm pacing, gentle endings, and the perfect length to settle little minds.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <Header />
      <Hero />
      <ModesSection />
      <CreativeSection />
      <BenefitsSection />
      <MoralsSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <Image
            src="/icon.png"
            alt="Milo Tales"
            width={36}
            height={36}
            className="rounded-lg shadow-sm ring-1 ring-white/10"
          />
          <span className="font-display text-xl font-bold text-foreground">
            Milo Tales
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-soft">
          <a href="#stories" className="hover:text-foreground transition">Stories</a>
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#morals" className="hover:text-foreground transition">For parents</a>
        </nav>
        <a
          href="#download"
          className="inline-flex items-center gap-2 rounded-full bg-brand text-white px-4 py-2 text-sm font-semibold shadow-md shadow-brand/30 hover:bg-brand-deep transition"
        >
          Download
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-aurora relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-glass-strong backdrop-blur px-3 py-1.5 text-xs font-semibold text-cream ring-1 ring-white/10 shadow-sm">
            <span className="size-1.5 rounded-full bg-brand" />
            New · Personalized AI bedtime stories
          </span>
          <h1 className="mt-5 font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-foreground">
            Bedtime stories,{" "}
            <span className="text-brand">made for your child.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg sm:text-xl leading-relaxed text-ink-soft">
            Pick a world, choose a hero, set the lesson. Milo writes a magical story
            starring your child — every single night, never the same twice.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#download"
              className="inline-flex items-center gap-3 rounded-2xl bg-foreground text-background px-6 py-4 font-semibold shadow-lg shadow-black/40 hover:scale-[1.02] transition"
            >
              <AppleLogo />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] opacity-70">Download on the</span>
                <span className="text-base">App Store</span>
              </div>
            </a>
            <a
              href="#stories"
              className="inline-flex items-center gap-2 rounded-2xl bg-glass-strong backdrop-blur text-foreground px-6 py-4 font-semibold ring-1 ring-white/10 hover:bg-glass transition"
            >
              See a sample story →
            </a>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-ink-soft">
            <Stars />
            <span>Loved by parents in 20+ countries</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-brand/20 via-gold/20 to-violet/20 blur-3xl" />
          <PhoneStack />
        </div>
      </div>
    </section>
  );
}

function PhoneStack() {
  return (
    <div className="relative mx-auto w-full max-w-md aspect-[4/5]">
      <Phone src="/onboarding/onboarding_2.png" className="absolute left-0 top-8 -rotate-6 w-[70%] z-10" />
      <Phone src="/onboarding/onboarding_3.png" className="absolute right-0 top-0 rotate-3 w-[72%] z-20" />
      <Phone src="/onboarding/onboarding_4.png" className="absolute right-4 bottom-0 rotate-6 w-[60%] z-30" />
    </div>
  );
}

function Phone({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div
      className={`rounded-[2.2rem] bg-black p-2 shadow-2xl ring-1 ring-black/10 ${className}`}
    >
      <div className="relative aspect-[9/19] overflow-hidden rounded-[1.8rem] bg-violet">
        <Image src={src} alt="" fill sizes="400px" className="object-cover" />
      </div>
    </div>
  );
}

function ModesSection() {
  return (
    <section id="stories" className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-aurora opacity-30" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            Story worlds
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold leading-tight">
            Nine magical worlds.{" "}
            <span className="text-gold">Endless adventures.</span>
          </h2>
          <p className="mt-5 text-lg text-ink-soft">
            From Alice's looking glass to a busy construction site, every world is
            crafted to spark imagination — and your child is always at the center.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6">
          {MODES.map((mode) => (
            <div
              key={mode.slug}
              className="group relative rounded-3xl overflow-hidden bg-glass ring-1 ring-white/10 hover:ring-brand/40 hover:-translate-y-1 transition-all duration-300 shadow-md shadow-black/30 hover:shadow-xl hover:shadow-black/50"
            >
              <div className="relative aspect-square">
                <Image
                  src={`/modes/${mode.slug}.png`}
                  alt={mode.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                    {mode.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-white/85">
                    {mode.blurb}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CreativeSection() {
  return (
    <section id="how" className="py-24 lg:py-32 bg-night text-white relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">
            Creative mode
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold leading-tight">
            Or build the story{" "}
            <span className="text-gold">from scratch.</span>
          </h2>
          <p className="mt-5 text-lg text-white/80">
            Want your child to be a unicorn detective on Mars? A dragon learning to
            share? Pick a hero, a place, a moral, and Milo writes the rest in seconds.
          </p>
          <div className="mt-8 space-y-4">
            <Step n={1} title="Pick a hero" body="Dragon, unicorn, fairy, robot — or your own kid." />
            <Step n={2} title="Pick a place" body="Anywhere. The moon, a candy forest, grandma's kitchen." />
            <Step n={3} title="Pick a lesson" body="Kindness, honesty, courage — or none at all." />
            <Step n={4} title="Listen together" body="A new bedtime story, ready in under a minute." />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {TYPES.map((t) => (
            <div
              key={t}
              className="aspect-square rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/15 p-3 flex items-center justify-center hover:bg-white/20 hover:scale-105 transition"
            >
              <Image
                src={`/types/${t}.png`}
                alt={t}
                width={80}
                height={80}
                className="size-full object-contain drop-shadow-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 size-9 rounded-full bg-gold text-violet font-bold flex items-center justify-center font-display">
        {n}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/70 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function BenefitsSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            Why parents love Milo
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold leading-tight">
            Bedtime, but actually magical.
          </h2>
        </div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-3xl bg-glass p-7 ring-1 ring-white/10 shadow-md shadow-black/30 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 transition"
            >
              <div className="size-11 rounded-2xl bg-brand/15 flex items-center justify-center text-brand">
                <Sparkle />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold">{b.title}</h3>
              <p className="mt-2 text-ink-soft leading-relaxed text-[15px]">
                {b.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MoralsSection() {
  const morals = [
    "Always be kind",
    "Be honest",
    "Be a good friend",
    "Never give up",
    "Think before you act",
    "Treat others the way you want to be treated",
  ];
  return (
    <section id="morals" className="py-24 lg:py-32 bg-night relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-5 gap-12 items-center">
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-gold">
            Lessons that stick
          </p>
          <h2 className="mt-3 font-display text-4xl sm:text-5xl font-bold leading-tight">
            Stories that{" "}
            <span className="text-brand">teach.</span>
          </h2>
          <p className="mt-5 text-lg text-ink-soft">
            Pick a moral and Milo weaves it gently into the story — no lectures,
            just a hero learning the same thing your child needs to.
          </p>
        </div>
        <div className="lg:col-span-3 grid sm:grid-cols-2 gap-3">
          {morals.map((m) => (
            <div
              key={m}
              className="rounded-2xl bg-glass px-5 py-4 ring-1 ring-white/10 flex items-center gap-3 shadow-md shadow-black/30"
            >
              <span className="size-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-display font-bold">
                ★
              </span>
              <span className="font-medium text-foreground">{m}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="download" className="py-24 lg:py-32 bg-background">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-aurora p-10 sm:p-16 text-center text-white ring-1 ring-white/10 shadow-2xl shadow-black/40">
          <div className="relative z-10">
            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              Tonight's story is{" "}
              <span className="text-gold">ready when you are.</span>
            </h2>
            <p className="mt-5 text-lg text-ink-soft max-w-xl mx-auto">
              Download Milo Tales and write your child into their first adventure.
              Free to try, magical from the very first page.
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-2xl bg-foreground text-background px-7 py-4 font-semibold shadow-xl shadow-black/40 hover:scale-[1.02] transition"
              >
                <AppleLogo />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] opacity-70">Download on the</span>
                  <span className="text-base">App Store</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 py-12">
      <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <Image
            src="/icon.png"
            alt=""
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="font-display font-bold">Milo Tales</span>
          <span className="text-sm text-ink-soft ml-2">
            © {new Date().getFullYear()}
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-ink-soft">
          <a href="#" className="hover:text-foreground transition">Privacy</a>
          <a href="#" className="hover:text-foreground transition">Terms</a>
          <a href="#" className="hover:text-foreground transition">Contact</a>
        </nav>
      </div>
    </footer>
  );
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.42 2.13-1.13 2.84-.78.78-1.94 1.4-3.05 1.31-.13-1.1.4-2.21 1.07-2.92.74-.78 2-1.36 3.11-1.23zM20.5 17.34c-.55 1.21-.81 1.75-1.5 2.82-.97 1.49-2.34 3.34-4.04 3.36-1.51.02-1.9-.99-3.95-.98-2.05.01-2.48 1-3.99.98-1.7-.02-2.99-1.69-3.96-3.18C.36 16.67-.18 11.07 2.55 8.21c1.27-1.34 3.18-2.18 5.04-2.18 1.95 0 3.18 1.07 4.79 1.07 1.56 0 2.51-1.07 4.77-1.07 1.7 0 3.5.93 4.78 2.53-4.2 2.3-3.51 8.32-1.43 8.78z" />
    </svg>
  );
}

function Stars() {
  return (
    <div className="flex gap-0.5 text-gold">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className="size-4 fill-current">
          <path d="M10 1.5l2.6 5.27 5.81.84-4.2 4.1.99 5.79L10 14.77l-5.2 2.73.99-5.79-4.2-4.1 5.81-.84z" />
        </svg>
      ))}
    </div>
  );
}

function Sparkle() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden="true">
      <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z" />
    </svg>
  );
}
