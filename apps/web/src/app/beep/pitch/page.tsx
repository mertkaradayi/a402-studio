import type { Metadata } from "next";
import Link from "next/link";

const problems = [
  "Hard to see real a402 + Beep flows without wiring CORS, wallets, and keys.",
  "Receipts feel abstract until you can validate and replay them with your team.",
  "Debugging failures is slow when you can’t share exact challenge/receipt states.",
];

const solutionPoints = [
  "One playground that flips Sandbox ↔ Live with zero code changes.",
  "Inspector that validates challenges/receipts against the a402 spec and cross-checks fields.",
  "Streaming + MCP console to exercise Beep tooling safely, with history and exports to share.",
];

const howItWorks = [
  {
    badge: "01",
    title: "Learn fast",
    text: "Load presets or your own challenges. See schema hints immediately.",
  },
  {
    badge: "02",
    title: "Run it",
    text: "Simulate or pay via Beep checkout, compare sandbox vs live, and drive streaming actions.",
  },
  {
    badge: "03",
    title: "Inspect & ship",
    text: "Validate receipts, cross-check against challenges, export cURL/TS/Python, and replay history.",
  },
];

const roadmap = [
  "Real Sui RPC lookups + facilitator signature verification.",
  "Wallet connect by default and production-grade Beep flows.",
  "Persistent history, team sharing, and richer debugging timelines.",
  "More MCP helpers plus guided checklists for prod hardening.",
];

export const metadata: Metadata = {
  title: "a402 Studio Pitch | Beep playground & inspector",
  description:
    "Why we built a402 Studio, who it serves, and how the Beep playground + inspector help teams ship proof-first payments on Sui fast.",
};

export default function BeepPitchPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0c] text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,#73ff6d0d,transparent_25%),radial-gradient(circle_at_82%_12%,#ff00ed14,transparent_28%),radial-gradient(circle_at_50%_82%,#04d9ff0f,transparent_24%)]" />
      <article className="relative mx-auto max-w-5xl px-6 py-16 lg:py-24 space-y-24">
        <section className="space-y-6 text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            a402 Studio · Beep playground
          </p>
          <div className="space-y-4">
            <h1 className="text-balance text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
              Beep (a402) playground, inspector, and dev tools in one scroll
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
              Learn, simulate, and ship Beep flows on Sui. Flip sandbox vs live, validate
              challenges/receipts, drive streaming, and export production snippets—without wiring
              everything first.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-neon-pink px-6 py-3 text-base font-semibold text-black shadow-lg shadow-neon-pink/30 transition hover:-translate-y-0.5 hover:bg-neon-pink/90"
            >
              Launch playground
              <span aria-hidden>↗</span>
            </Link>
            <Link
              href="mailto:hello@beep.build?subject=a402%20Studio%20pitch"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:border-neon-cyan hover:text-neon-cyan"
            >
              Start a thread
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/5 bg-[#0e0e10]/70 px-8 py-10">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Why it exists</p>
          <h2 className="text-4xl font-semibold text-white">Beep + a402 needed a real sandbox</h2>
          <ul className="space-y-3 text-lg text-muted-foreground">
            {problems.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-neon-pink">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/5 bg-[#0e0e10]/80 px-8 py-10">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">What we built</p>
          <h2 className="text-4xl font-semibold text-white">a402 Studio is the Beep playground</h2>
          <ul className="space-y-3 text-lg text-muted-foreground">
            {solutionPoints.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-neon-yellow">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-6 rounded-2xl border border-white/5 bg-[#0e0e10]/80 px-8 py-10">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">How it works</p>
            <h2 className="text-4xl font-semibold text-white">Three simple steps</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-white/10 bg-black/40 p-5 text-white/80"
              >
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-neon-cyan">
                  {item.badge}
                </p>
                <p className="mt-3 text-lg font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-white/5 bg-[#0e0e10]/80 px-8 py-10">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Where it goes</p>
          <h2 className="text-4xl font-semibold text-white">Near-term roadmap</h2>
          <ul className="space-y-3 text-lg text-muted-foreground">
            {roadmap.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-neon-green">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#0f0f12] via-[#0b0b0c] to-black px-8 py-12 text-center">
          <div className="mx-auto max-w-3xl space-y-4">
            <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Ready</p>
            <h2 className="text-4xl font-semibold text-white">
              See the flow, ship the flow, share the flow
            </h2>
            <p className="text-lg text-muted-foreground">
              Jump into the playground or start a thread. We’ll tailor a402 Studio + Beep to your
              flow and get you to production fast.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-black transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Explore the playground
                <span aria-hidden>↗</span>
              </Link>
              <Link
                href="mailto:hello@beep.build?subject=a402%20Studio%20pitch%20follow-up"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:border-neon-pink hover:text-neon-pink"
              >
                Talk with us
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}

