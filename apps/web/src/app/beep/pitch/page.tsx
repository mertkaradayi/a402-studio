import type { Metadata } from "next";
import Link from "next/link";

const audiences = [
  {
    title: "Product + eng teams shipping on Sui",
    points: [
      "Need verifiable payment signals to sync UX and back office",
      "Care about speed-to-ship without sacrificing safety",
      "Prefer primitives (attestations, webhooks) over custom glue",
    ],
  },
  {
    title: "Platforms / marketplaces",
    points: [
      "Require trustable receipts for payouts and access controls",
      "Want replay-safe events instead of brittle webhook chains",
      "Need clean logs to resolve disputes fast",
    ],
  },
  {
    title: "Risk, compliance, ops",
    points: [
      "Need immutable proofs for audits and monitoring",
      "Value explicit state over inferred ‘maybe paid’ flags",
      "Prefer automation to reduce manual checks",
    ],
  },
];

const buildReasons = [
  {
    label: "Why we built Beep",
    body: "Payments, identity, and fulfillment drifted apart. Webhooks arrived late or not at all, UIs lied, and ops teams had to guess. We built Beep to keep proofs and money in lockstep.",
  },
  {
    label: "What Beep is",
    body: "A proof-first layer on Sui + a402 that issues attestations at the moment of payment. Those proofs drive UX, access control, and fulfillment—no more fragile glue.",
  },
];

const modules = [
  {
    title: "Attestation engine",
    detail:
      "Mint signed receipts on Sui with the exact facts you care about (who, what, when, amount, context). Replay-safe, queryable, and auditable.",
  },
  {
    title: "Widget + SDK",
    detail:
      "Drop in UI and typed SDK to collect, verify, and hand back proofs. Minimal ceremony; override defaults when needed.",
  },
  {
    title: "Automation hooks",
    detail:
      "Webhooks and events aligned to attestations, not webhook luck. Gate fulfillment and access directly on proofs.",
  },
  {
    title: "Observability",
    detail:
      "Receipts stay consistent across UI and backend. Clear logs and timelines make support and compliance sane.",
  },
];

const howItWorks = [
  {
    badge: "01",
    title: "Drop in",
    text: "Embed the widget or call the API. Specify what you want attested (amounts, IDs, contexts).",
  },
  {
    badge: "02",
    title: "Attest",
    text: "Beep issues a signed receipt on Sui the moment the payment or identity event lands.",
  },
  {
    badge: "03",
    title: "Automate",
    text: "Your backend and frontend read the same proof to unlock access, trigger fulfillment, or clear risk checks.",
  },
];

const differentiation = [
  "Proofs at the point of payment, not afterthought webhooks",
  "Programmable attestations you can gate flows against",
  "Minimal surface area: small widget, concise SDK, pragmatic defaults",
  "Defense in depth: replay protection, signatures, and auditability",
];

export const metadata: Metadata = {
  title: "Beep Pitch | Proof-first payments on Sui",
  description:
    "Why we built Beep, who it serves, and how proof-first payments keep products, ops, and risk in sync.",
};

export default function BeepPitchPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0c] text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,#73ff6d0d,transparent_25%),radial-gradient(circle_at_82%_12%,#ff00ed14,transparent_28%),radial-gradient(circle_at_50%_82%,#04d9ff0f,transparent_24%)]" />
      <article className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24 space-y-16">
        <section className="dither-surface overflow-hidden rounded-2xl border border-white/5 bg-[#111114]/80 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.8)]">
          <div className="grid items-center gap-10 px-6 py-12 lg:grid-cols-12 lg:px-10">
            <div className="space-y-5 lg:col-span-7">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Beep
                <span className="h-px w-6 bg-gradient-to-r from-white/40 via-white/80 to-white/0" />
                Pitch snapshot
              </p>
              <div className="space-y-3">
                <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                  Proof-first payments that keep product, ops, and risk aligned
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  Beep turns every payment into a programmable proof. Built on Sui with a402 rails,
                  it keeps state consistent across your UI, backend, and compliance stack.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full bg-neon-pink px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-neon-pink/30 transition hover:-translate-y-0.5 hover:bg-neon-pink/90"
                >
                  Launch playground
                  <span aria-hidden>↗</span>
                </Link>
                <Link
                  href="mailto:hello@beep.build?subject=Beep%20pitch"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-neon-cyan hover:text-neon-cyan"
                >
                  Start a thread
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="glass relative overflow-hidden rounded-xl p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#73ff6d0c,transparent_50%),radial-gradient(circle_at_80%_0%,#ff00ed0a,transparent_45%)]" />
                <div className="relative space-y-4 text-sm">
                  <div className="flex items-center justify-between text-white/80">
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Snapshot
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-white">
                      proof-first
                    </span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white/90">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      <span>State</span>
                      <span>Aligned</span>
                    </div>
                    <p className="mt-2 text-base font-semibold text-neon-green">
                      Payment ↔ Proof ↔ Product
                    </p>
                    <p className="mt-2 text-xs text-white/80">
                      Every payment mints a signed receipt on Sui. That receipt drives what users
                      see, what ops unlocks, and what compliance can audit.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="h-px flex-1 bg-gradient-to-r from-white/30 via-white/60 to-white/0" />
                    Built for teams who hate brittle payment glue
                    <span className="h-px flex-1 bg-gradient-to-l from-white/30 via-white/60 to-white/0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Why & what</p>
            <h2 className="text-2xl font-semibold text-white">Why we built Beep</h2>
            <p className="text-muted-foreground">
              Proofs, payments, and UX were drifting. We wanted a path where products could move
              fast while risk and ops stayed confident.
            </p>
          </div>
          <div className="lg:col-span-7 grid gap-4 rounded-2xl border border-white/5 bg-[#0e0e10]/80 p-6">
            {buildReasons.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/80"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-neon-cyan">{item.label}</p>
                <p className="text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border border-white/5 bg-[#0e0e10]/70 p-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">For whom</p>
              <h2 className="text-2xl font-semibold text-white">Who gets the most from Beep</h2>
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-neon-yellow">
              Builders, platforms, ops
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {audiences.map((audience) => (
              <div
                key={audience.title}
                className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/80"
              >
                <p className="text-sm font-semibold text-white">{audience.title}</p>
                <ul className="mt-3 space-y-2 text-muted-foreground">
                  {audience.points.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border border-white/5 bg-[#0e0e10]/80 p-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">What we ship</p>
              <h2 className="text-2xl font-semibold text-white">Modules that stay out of your way</h2>
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-neon-yellow">
              Minimal surface, maximal signal
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {modules.map((mod) => (
              <div
                key={mod.title}
                className="rounded-xl border border-white/10 bg-black/40 p-5 transition hover:border-neon-pink/40 hover:shadow-[0_10px_40px_-24px_rgba(255,0,237,0.6)]"
              >
                <div className="mb-3 h-[2px] w-10 bg-gradient-to-r from-neon-pink via-neon-yellow to-neon-cyan" />
                <p className="text-lg font-semibold text-white">{mod.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{mod.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              How it works
            </p>
            <h2 className="text-2xl font-semibold text-white">From idea to production</h2>
            <p className="text-muted-foreground">
              Keep your stack. Add proofs where they matter. Let automation run on facts, not
              guesses.
            </p>
          </div>
          <div className="lg:col-span-7 grid gap-4 rounded-2xl border border-white/5 bg-[#0e0e10]/70 p-6">
            <div className="grid gap-3 md:grid-cols-3">
              {howItWorks.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/80"
                >
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-neon-cyan">
                    {item.badge}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-muted-foreground">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-neon-yellow/30 bg-white/5 p-4 text-sm text-white/80">
              <p className="text-xs uppercase tracking-[0.2em] text-neon-yellow">
                Outcome
              </p>
              <p className="mt-2 text-muted-foreground">
                UI and backend align on the same proof. Ops and compliance get auditable facts.
                Users get fast, confident experiences.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border border-white/5 bg-[#0e0e10]/70 p-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Why us</p>
              <h2 className="text-2xl font-semibold text-white">Differentiation</h2>
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-neon-yellow">
              Built with rails and receipts in mind
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {differentiation.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/80"
              >
                • {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#0f0f12] via-[#0b0b0c] to-black px-6 py-10 text-center">
          <div className="mx-auto max-w-2xl space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Next</p>
            <h2 className="text-3xl font-semibold text-white">
              Want the deeper dive or a live walkthrough?
            </h2>
            <p className="text-muted-foreground">
              Jump into the playground or start a thread. We’ll tailor Beep to your flow and get you
              to production fast.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-white/90"
              >
                Explore the playground
                <span aria-hidden>↗</span>
              </Link>
              <Link
                href="mailto:hello@beep.build?subject=Beep%20pitch%20follow-up"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-neon-pink hover:text-neon-pink"
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

