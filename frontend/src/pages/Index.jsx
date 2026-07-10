import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Header } from "@/components/site/Header";
import { MarketSnapshot } from "@/components/site/MarketSnapshot";
import {
  FeatureGrid,
  FinalCTA,
  Footer,
  HowItWorks,
  Personas,
  ProblemSolution,
  SocialProof,
  Testimonials,
} from "@/components/site/sections";

function BrowserMockup() {
  return (
    <div className="rounded-2xl border-2 border-ink bg-paper shadow-hard-xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 rounded-t-2xl border-b-2 border-ink bg-ink px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-body text-xs font-bold text-paper/70">verdict.ai / nvidia</span>
      </div>
      {/* Content */}
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between border-2 border-ink bg-brand p-4">
          <div>
            <p className="font-body text-xs font-bold uppercase text-charcoal/70">Verdict</p>
            <p className="font-display text-3xl font-extrabold tracking-tighter text-ink">INVEST</p>
          </div>
          <div className="text-right">
            <p className="font-body text-xs font-bold text-charcoal/70">Confidence</p>
            <p className="font-display text-2xl font-extrabold text-ink">82%</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="border-2 border-ink bg-sage p-3">
            <p className="font-body text-[10px] font-bold uppercase text-charcoal/70">Growth</p>
            <div className="mt-2 flex h-16 items-end gap-1.5">
              {[40, 55, 45, 70, 85, 100].map((h, i) => (
                <span
                  key={i}
                  className="flex-1 border-2 border-ink bg-charcoal"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          <div className="border-2 border-ink bg-charcoal p-3 text-paper">
            <p className="font-body text-[10px] font-bold uppercase text-sage">Moat</p>
            <p className="mt-2 font-display text-xl font-extrabold">Wide</p>
            <p className="mt-1 font-body text-[11px] text-sage">Ecosystem lock-in</p>
          </div>
        </div>
        <div className="space-y-2">
          {["Dominant compute platform", "Strong pricing power", "Cyclical demand risk"].map(
            (t, i) => (
              <div key={t} className="flex items-center gap-2 border-2 border-ink bg-paper p-2">
                <span
                  className={`h-3 w-3 border-2 border-ink ${i < 2 ? "bg-brand" : "bg-[#ff5f57]"}`}
                />
                <span className="font-body text-xs font-bold text-charcoal">{t}</span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="pt-20">
        {/* Hero */}
        <section className="dot-grid border-b-2 border-ink bg-brand">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="inline-block rounded-full border-2 border-ink bg-paper px-4 py-1.5 font-body text-sm font-bold text-ink shadow-hard">
                NEW: AI Investment Research Agent
              </span>
              <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tighter text-ink sm:text-6xl lg:text-7xl">
                Invest or pass?
                <br />
                <span className="text-transparent" style={{ WebkitTextStroke: "2px #000000" }}>
                  Let AI decide.
                </span>
              </h1>
              <p className="mt-6 max-w-md font-body text-lg font-medium text-charcoal">
                Name any company. Verdict's AI agent researches the business, weighs the risks, and
                returns a decisive call — with the reasoning behind it.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/dashboard"
                  className="neo-press-lg inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-ink px-7 py-3.5 font-body font-bold text-paper"
                >
                  Try it now <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#how"
                  className="neo-press inline-flex items-center justify-center rounded-xl border-2 border-ink bg-paper px-7 py-3.5 font-body font-bold text-ink"
                >
                  How it works
                </a>
              </div>
            </div>
            <div className="lg:pl-6">
              <BrowserMockup />
            </div>
          </div>
        </section>

        <SocialProof />

        <MarketSnapshot />

        <ProblemSolution />
        <FeatureGrid />
        <HowItWorks />
        <Personas />
        <Testimonials />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
