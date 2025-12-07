import type { Metadata } from "next";
import Link from "next/link";

const pillars = [
  {
    title: "Proof-first payments",
    detail:
      "Beep issues verifiable receipts the moment money moves—built on Sui + a402 so value and proof stay in lockstep.",
  },
  {
    title: "Programmable trust",
    detail:
      "Attestations, webhooks, and a clean API so you can gate access, trigger fulfillment, or clear risk checks automatically.",
  },
  {
    title: "Low-friction by design",
    detail:
      "Drop-in experiences with minimal new surface area—lightweight UI, simple SDK, and pragmatic defaults you can override.",
  },
  {
    title: "Defense in depth",
    detail:
      "Built-in verification, replay protection, and transparent audit trails so you can ship faster without sacrificing safety.",
  },
];

const integration = [
  {
    label: "Drop in",
    copy: "Embed the Beep widget or call the API to verify a payment or identity event.",
  },
  {
    label: "Attest",
    copy: "We mint a signed receipt on Sui with the exact facts you need to trust (who, what, when, amount).",
  },
  {
    label: "Automate",
    copy: "Use webhooks or SDK helpers to trigger fulfillment, access, or settlement with guardrails.",
  },
];

export const metadata: Metadata = {
  title: "Beep | Proof-first payments",
  description:
    "Beep turns payments into verifiable, programmable proofs—built for teams shipping on Sui with a402 rails.",
};

export default function BeepStoryPage() {
  return (
    <main className="min-h-screen bg-[#0b0b0c] text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,#73ff6d0f,transparent_25%),radial-gradient(circle_at_80%_10%,#ff00ed12,transparent_26%),radial-gradient(circle_at_50%_80%,#04d9ff0f,transparent_24%)]" />
      <article className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24 space-y-20">
        <section className="dither-surface overflow-hidden rounded-2xl border border-white/5 bg-[#111114]/80 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.8)]">
          <div className="grid items-center gap-10 px-6 py-12 lg:grid-cols-12 lg:px-10">
            <div className="space-y-6 lg:col-span-7">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Beep
                <span className="h-px w-6 bg-gradient-to-r from-white/40 via-white/80 to-white/0" />
                Proof-first payments
              </p>
              <div className="space-y-4">
                <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                  Turn every payment into a verifiable signal you can program
                </h1>
                <p className="max-w-2xl text-lg text-muted-foreground">
                  Beep is the trust layer for builders who need payments, identity, and
                  fulfillment to agree in real time. Born from shipping a402 rails on Sui, we
                  keep the proof as close to the money as possible—without adding friction for
                  your users.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-full bg-neon-pink px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-neon-pink/30 transition hover:-translate-y-0.5 hover:bg-neon-pink/90"
                >
                  Open the playground
                  <span aria-hidden>↗</span>
                </Link>
                <Link
                  href="mailto:hello@beep.build?subject=Beep%20x%20Sui"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-neon-cyan hover:text-neon-cyan"
                >
                  Talk to us
                  <span aria-hidden>→</span>
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span className="rounded-full border border-white/10 px-3 py-1">
                  Sui native
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  a402 compatible
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  Builder-first
                </span>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="glass relative overflow-hidden rounded-xl p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#73ff6d0c,transparent_50%),radial-gradient(circle_at_80%_0%,#ff00ed0a,transparent_45%)]" />
                <div className="relative space-y-4 text-sm">
                  <div className="flex items-center justify-between text-white/80">
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Flow snapshot
                    </span>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold text-white">
                      live
                    </span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white/90">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        payer
                      </span>
                      <span className="text-xs font-semibold text-neon-green">verified</span>
                    </div>
                    <div className="mt-1 text-base font-semibold">0x42…beep</div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          amount
                        </p>
                        <p className="font-semibold">$24.00 USDC</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          latency
                        </p>
                        <p className="font-semibold text-neon-cyan">{"< 1.2s"}</p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-md border border-white/5 bg-white/5 px-3 py-2 text-xs text-white/80">
                      Beep attests who paid, how much, and when—signed on Sui so your backend and
                      UI can trust the same source of truth.
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    <span className="h-px flex-1 bg-gradient-to-r from-white/30 via-white/60 to-white/0" />
                    Built for builders who hate fragile payment glue
                    <span className="h-px flex-1 bg-gradient-to-l from-white/30 via-white/60 to-white/0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Origin</p>
            <h2 className="text-2xl font-semibold text-white">Born from broken handoffs</h2>
            <p className="text-muted-foreground">
              Beep started as an internal tool to debug the handoff between payments, identity,
              and fulfillment. We kept finding that trust signals were scattered: a webhook here,
              a CSV there, and a UI state that drifted from reality. So we brought the proof
              closer to the money and made it programmable.
            </p>
            <div className="space-y-2 text-sm text-white/80">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-neon-pink" />
                <span>Instant attestations instead of brittle webhooks.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-neon-green" />
                <span>Receipts you can query, sign, and automate against.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-neon-cyan" />
                <span>Minimal UI so builders stay fast and users stay happy.</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 grid gap-4 rounded-2xl border border-white/5 bg-[#0e0e10]/80 p-6">
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="rounded-full border border-white/10 px-3 py-1 bg-white/5 text-white/80">
                Problem → Solution
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-white/70">
                For teams shipping fast on Sui
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <p className="text-sm font-semibold text-white">The drag</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>• Fragile payment webhooks and mismatched UI states</li>
                  <li>• Manual verification to unblock fulfillment</li>
                  <li>• Compliance and fraud checks bolted on late</li>
                </ul>
              </div>
              <div className="rounded-xl border border-neon-cyan/30 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Beep’s answer</p>
                <ul className="mt-3 space-y-2 text-sm text-white/80">
                  <li>• Proofs minted at the point of payment (a402 rails)</li>
                  <li>• Attestations you can gate flows and UX against</li>
                  <li>• Auditable, replay-safe events with sane defaults</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8 rounded-2xl border border-white/5 bg-[#0e0e10]/70 p-6">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                What you ship with
              </p>
              <h2 className="text-2xl font-semibold text-white">Pillars that keep you moving</h2>
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-neon-yellow">
              Minimal surface, maximal signal
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-xl border border-white/10 bg-black/40 p-5 transition hover:border-neon-pink/40 hover:shadow-[0_10px_40px_-24px_rgba(255,0,237,0.6)]"
              >
                <div className="mb-3 h-[2px] w-10 bg-gradient-to-r from-neon-pink via-neon-yellow to-neon-cyan" />
                <h3 className="text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{pillar.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Integration path
            </p>
            <h2 className="text-2xl font-semibold text-white">From concept to production, fast</h2>
            <p className="text-muted-foreground">
              Keep your stack: call the API, add the widget, and wire webhooks. Beep focuses on
              verifiable state so you can stay focused on product and revenue.
            </p>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="rounded-full border border-white/10 px-3 py-1">API + widget</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Webhooks</span>
              <span className="rounded-full border border-white/10 px-3 py-1">Sui receipts</span>
            </div>
          </div>
          <div className="lg:col-span-7 space-y-4 rounded-2xl border border-white/5 bg-[#0e0e10]/70 p-6">
            <div className="grid gap-3 md:grid-cols-3">
              {integration.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/80"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-neon-cyan">{item.label}</p>
                  <p className="mt-2 text-muted-foreground">{item.copy}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-neon-yellow/30 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neon-yellow">Sample shape</p>
              <div className="mt-3 space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-neon-pink px-2 py-1 text-[11px] font-semibold text-black">
                    attest
                  </span>
                  <span className="text-muted-foreground">POST /api/beep/verify</span>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/50 p-3 font-mono text-xs text-neon-green">
                  {"{"}
                  <div className="ml-4 text-white/80">
                    "payer": "0x42...beep",
                    <br />
                    "amount": "24.00",
                    <br />
                    "currency": "USDC",
                    <br />
                    "context": "order-4821"
                  </div>
                  {"}"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive a signed receipt + webhook; gate fulfillment on the attestation, not the
                  hope that a webhook arrived.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#0f0f12] via-[#0b0b0c] to-black px-6 py-10 text-center">
          <div className="mx-auto max-w-2xl space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Call to act</p>
            <h2 className="text-3xl font-semibold text-white">
              Ready to ship proof-first payments?
            </h2>
            <p className="text-muted-foreground">
              Open the playground to see Beep in action, or drop us a line to tailor the flow to
              your stack.
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
                href="mailto:hello@beep.build?subject=Beep%20integration"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-neon-pink hover:text-neon-pink"
              >
                Start a thread
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}

