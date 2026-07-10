import {
  BarChart3,
  Brain,
  FileSearch,
  Gauge,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Zap,
} from "lucide-react";

/* ---------------- Social proof marquee ---------------- */
export function SocialProof() {
  const brands = ["ACME", "GLOBEX", "INITECH", "UMBRELLA", "HOOLI", "STARK", "WAYNE", "SOYLENT"];
  const row = [...brands, ...brands];
  return (
    <section className="overflow-hidden border-b-2 border-ink bg-charcoal py-6">
      <div className="flex w-max animate-marquee gap-16 px-8">
        {row.map((b, i) => (
          <span
            key={i}
            className="font-display text-3xl font-extrabold tracking-tighter text-sage opacity-50"
          >
            {b}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Problem vs Solution ---------------- */
export function ProblemSolution() {
  const problems = [
    "Hours lost skimming filings, transcripts and news",
    "Bias and gut-feel creeping into every decision",
    "No structured record of why you passed or bought",
  ];
  const solutions = [
    "A full research pass in under a minute",
    "A cold, consistent invest-or-pass framework",
    "Bull case, bear case and reasoning, saved every time",
  ];
  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="mb-12 text-center font-display text-4xl font-extrabold tracking-tighter text-ink sm:text-5xl">
          Research shouldn't take all day
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border-2 border-dashed border-charcoal/40 bg-[#f4f4f5]/70 p-8 opacity-80">
            <p className="mb-6 font-body text-sm font-bold uppercase tracking-widest text-charcoal/60">
              The old way
            </p>
            <ul className="space-y-4">
              {problems.map((p) => (
                <li key={p} className="flex items-start gap-3 font-body font-medium text-charcoal">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-charcoal/40 text-charcoal/60">
                    ✕
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border-2 border-ink bg-brand p-8 shadow-hard-lg">
            <p className="mb-6 font-body text-sm font-bold uppercase tracking-widest text-charcoal/70">
              With Verdict
            </p>
            <ul className="space-y-4">
              {solutions.map((s) => (
                <li key={s} className="flex items-start gap-3 font-body font-bold text-ink">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-paper">
                    ✓
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Feature grid ---------------- */
const FEATURES = [
  {
    icon: FileSearch,
    title: "Deep research",
    body: "The agent profiles the business, model, market position and scale before it forms an opinion.",
  },
  {
    icon: BarChart3,
    title: "Financial read",
    body: "Growth, margins, balance-sheet health and valuation, weighed like an analyst would.",
  },
  {
    icon: ShieldCheck,
    title: "Risk & moat",
    body: "It hunts for the competitive edge and the threats that could break the thesis.",
  },
  {
    icon: Scale,
    title: "A clear call",
    body: "No fence-sitting — a decisive INVEST or PASS with a confidence score.",
  },
  {
    icon: Brain,
    title: "Full reasoning",
    body: "Bull case, bear case and the research trail behind every verdict.",
  },
  {
    icon: Gauge,
    title: "Fast",
    body: "A complete multi-step research flow returns in about a minute.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="border-y-2 border-ink bg-brand py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="mb-12 text-center font-display text-4xl font-extrabold tracking-tighter text-ink sm:text-5xl">
          An analyst that never sleeps
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="group border-2 border-ink bg-paper p-6 shadow-hard">
              <span className="mb-5 flex h-16 w-16 items-center justify-center border-2 border-ink bg-sage transition-colors group-hover:bg-brand">
                <Icon className="h-8 w-8 text-ink" />
              </span>
              <h3 className="mb-2 font-display text-2xl font-extrabold tracking-tight text-ink">
                {title}
              </h3>
              <p className="font-body text-charcoal">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */
const STEPS = [
  {
    icon: FileSearch,
    glow: "var(--color-sage)",
    title: "Name a company",
    body: "Type any public company. The agent kicks off a structured research plan.",
  },
  {
    icon: Sparkles,
    glow: "var(--color-brand)",
    title: "AI investigates",
    body: "A LangGraph agent chains profile, financials and risk analysis together.",
  },
  {
    icon: Target,
    glow: "#ffffff",
    title: "Get the verdict",
    body: "A decisive invest-or-pass call, with confidence and the reasoning behind it.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-charcoal py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="mb-16 text-center font-display text-4xl font-extrabold tracking-tighter text-paper sm:text-5xl">
          Three steps to a decision
        </h2>
        <div className="relative grid gap-12 md:grid-cols-3">
          <div className="absolute left-0 right-0 top-12 hidden h-0.5 bg-graphite md:block" />
          {STEPS.map(({ icon: Icon, glow, title, body }, i) => (
            <div key={title} className="relative flex flex-col items-center text-center">
              <span
                className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-ink bg-charcoal"
                style={{ boxShadow: `0 0 0 4px ${glow}` }}
              >
                <Icon className="h-10 w-10 text-paper" />
              </span>
              <span className="mb-2 font-display text-sm font-bold uppercase tracking-widest text-sage">
                Step {i + 1}
              </span>
              <h3 className="mb-2 font-display text-2xl font-extrabold tracking-tight text-paper">
                {title}
              </h3>
              <p className="max-w-xs font-body text-sage">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Personas ---------------- */
export function Personas() {
  return (
    <section id="personas" className="bg-paper py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="mb-12 text-center font-display text-4xl font-extrabold tracking-tighter text-ink sm:text-5xl">
          Built for anyone weighing a bet
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="border-2 border-ink bg-sage p-7 shadow-hard">
            <span className="mb-6 inline-block rounded-full border-2 border-ink bg-paper px-3 py-1 font-body text-xs font-bold uppercase text-ink">
              Retail investors
            </span>
            <p className="font-body font-bold text-charcoal">
              Pressure-test a stock idea before you commit real money — with an unbiased second
              opinion.
            </p>
          </div>
          <div className="border-2 border-ink bg-brand p-7 shadow-hard-lg">
            <span className="mb-6 inline-block rounded-full border-2 border-ink bg-paper px-3 py-1 font-body text-xs font-bold uppercase text-ink">
              Analysts
            </span>
            <p className="font-body font-bold text-ink">
              Generate a fast first-pass brief so you spend your time on the calls that matter.
            </p>
          </div>
          <div className="border-2 border-ink bg-graphite p-7 text-paper shadow-hard">
            <span className="mb-6 inline-block rounded-full border-2 border-ink bg-paper px-3 py-1 font-body text-xs font-bold uppercase text-ink">
              Founders & angels
            </span>
            <p className="font-body font-bold text-paper">
              Benchmark a competitor or a target with a structured invest-or-pass framework.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */
const REVIEWS = [
  {
    name: "Maya R.",
    role: "Retail investor",
    text: "It caught a risk on a stock I was about to buy that I completely missed. Genuinely useful.",
  },
  {
    name: "Devon K.",
    role: "Buy-side analyst",
    text: "The bull/bear split saves me a first-draft every single morning.",
  },
  {
    name: "Priya S.",
    role: "Angel investor",
    text: "A cold, consistent framework beats my gut feel more often than I'd like to admit.",
  },
];

export function Testimonials() {
  return (
    <section id="reviews" className="bg-sage py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="mb-12 text-center font-display text-4xl font-extrabold tracking-tighter text-ink sm:text-5xl">
          People who stopped guessing
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <div
              key={r.name}
              className="rounded-tr-3xl rounded-bl-3xl border-2 border-ink bg-paper p-6 shadow-hard"
            >
              <div className="mb-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-star text-star" />
                ))}
              </div>
              <p className="mb-5 font-body font-medium text-charcoal">"{r.text}"</p>
              <p className="font-display font-extrabold tracking-tight text-ink">{r.name}</p>
              <p className="font-body text-sm text-charcoal/60">{r.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Final CTA + Footer ---------------- */
export function FinalCTA() {
  return (
    <section className="dot-grid border-b-2 border-ink bg-brand py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-display text-5xl font-extrabold tracking-tighter text-ink sm:text-6xl">
          Get a verdict in a minute
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-body text-lg font-medium text-charcoal">
          Name a company. Let the AI do the research. Make a sharper call.
        </p>
        <a
          href="/dashboard"
          className="neo-press-lg mt-8 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-ink px-8 py-4 font-body text-lg font-bold text-paper"
        >
          Run a Verdict <Zap className="h-5 w-5 fill-brand text-brand" />
        </a>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="bg-charcoal py-14 text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center border-2 border-paper/20 bg-graphite">
              <Zap className="h-4 w-4 fill-brand text-brand" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tighter">Verdict</span>
          </div>
          <p className="mt-4 font-body text-sm text-sage">
            AI investment research that decides — and shows its work.
          </p>
        </div>
        {[
          ["Product", ["Features", "How it works", "Reviews"]],
          ["Company", ["About", "Careers", "Contact"]],
          ["Legal", ["Privacy", "Terms", "Disclaimer"]],
        ].map(([title, links]) => (
          <div key={title}>
            <p className="mb-4 font-display font-extrabold tracking-tight">{title}</p>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l}>
                  <a href="/dashboard" className="font-body text-sm text-sage hover:text-brand">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t-2 border-graphite px-4 pt-6 sm:px-6">
        <p className="font-body text-sm text-sage/70">
          © {new Date().getFullYear()} Verdict. Not financial advice. Built with LangGraph.js.
        </p>
      </div>
    </footer>
  );
}
