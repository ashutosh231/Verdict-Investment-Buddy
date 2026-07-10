import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  Gauge,
  History,
  Loader2,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from "lucide-react";

import { Header } from "@/components/site/Header";
import { ResearchAgent } from "@/components/site/ResearchAgent";
import { VerdictReport } from "@/components/site/VerdictReport";
import { DashboardTrends } from "@/components/site/DashboardTrends";
import { LiveTicker } from "@/components/site/LiveTicker";
import { LiveNews } from "@/components/site/LiveNews";
import { MarketMovers } from "@/components/site/MarketMovers";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

function StatTile({ label, value, icon, className = "" }) {
  return (
    <div className={`border-2 border-ink p-4 shadow-hard ${className}`}>
      <div className="flex items-center justify-between">
        <p className="font-body text-[11px] font-bold uppercase tracking-widest opacity-70">
          {label}
        </p>
        {icon}
      </div>
      <p className="mt-1 font-display text-3xl font-extrabold tracking-tighter">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    document.title = "Dashboard — Verdict";
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await api.get("/api/research/history");
      setHistory(res.data.history ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (user) loadHistory();
  }, [user, loadHistory]);

  const recentSearches = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const h of history) {
      const key = h.company.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push(h.company);
      }
      if (out.length >= 8) break;
    }
    return out;
  }, [history]);

  const stats = useMemo(() => {
    const total = history.length;
    const invest = history.filter((h) => h.decision === "INVEST").length;
    const avgConf = total ? Math.round(history.reduce((s, h) => s + h.confidence, 0) / total) : 0;
    const lowRisk = history.filter((h) => h.riskLevel?.toUpperCase() === "LOW").length;
    return { total, invest, avgConf, lowRisk };
  }, [history]);

  const openFromHistory = useCallback((item) => {
    if (item.verdict) {
      setSelected(item.verdict);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand">
        <Loader2 className="h-8 w-8 animate-spin text-ink" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand">
      <Header />
      <div className="fixed left-0 right-0 top-20 z-40">
        <LiveTicker />
      </div>

      <main className="dot-grid min-h-screen pt-[124px]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {/* Hero greeting */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mb-8 flex flex-wrap items-end justify-between gap-4"
          >
            <div>
              <span className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-3 py-1 font-body text-xs font-bold uppercase tracking-widest text-ink shadow-hard">
                <Sparkles className="h-3.5 w-3.5" /> AI research desk
              </span>
              <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tighter text-ink sm:text-5xl">
                Hey {user.name.split(" ")[0] || "there"} 👋
              </h1>
              <p className="mt-2 font-body text-lg font-medium text-charcoal">
                Name a company and let the AI reach a verdict.
              </p>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
            className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
          >
            <StatTile
              label="Total verdicts"
              value={stats.total}
              icon={<BarChart3 className="h-5 w-5 text-ink" />}
              className="bg-paper"
            />
            <StatTile
              label="Invest calls"
              value={stats.invest}
              icon={<ThumbsUp className="h-5 w-5 text-ink" />}
              className="bg-brand"
            />
            <StatTile
              label="Avg confidence"
              value={`${stats.avgConf}%`}
              icon={<Gauge className="h-5 w-5 text-ink" />}
              className="bg-sage"
            />
            <StatTile
              label="Low-risk picks"
              value={stats.lowRisk}
              icon={<TrendingUp className="h-5 w-5 text-paper" />}
              className="bg-charcoal text-paper"
            />
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* Main column */}
            <div className="space-y-8">
              {/* Research surface */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="border-2 border-ink bg-paper p-6 shadow-hard-lg"
              >
                <ResearchAgent onResult={setSelected} onComplete={loadHistory} />
              </motion.div>

              {selected ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="neo-press inline-flex items-center gap-2 rounded-lg border-2 border-ink bg-paper px-4 py-2 font-body text-sm font-bold text-ink"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to overview
                  </button>
                  <VerdictReport verdict={selected} />
                </motion.div>
              ) : (
                <>
                  {/* Market movers */}
                  <section>
                    <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink">
                      <TrendingUp className="h-6 w-6" /> Market movers
                    </h2>
                    <MarketMovers />
                  </section>

                  {/* Research trends */}
                  <section>
                    <h2 className="mb-4 flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight text-ink">
                      <BarChart3 className="h-6 w-6" /> Your research trends
                    </h2>
                    {history.length === 0 ? (
                      <div className="border-2 border-ink bg-paper p-8 text-center shadow-hard">
                        <Search className="mx-auto mb-3 h-8 w-8 text-ink" />
                        <p className="font-display text-lg font-extrabold tracking-tight text-ink">
                          No research yet
                        </p>
                        <p className="mt-1 font-body text-sm text-charcoal/70">
                          Search a company above to get your first verdict, charts, and report.
                        </p>
                      </div>
                    ) : (
                      <DashboardTrends history={history} />
                    )}
                  </section>
                </>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-[136px] lg:self-start">
              {/* Recent searches */}
              <div className="border-2 border-ink bg-paper p-5 shadow-hard">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink">
                  <Search className="h-5 w-5" /> Recent searches
                </h2>
                {recentSearches.length === 0 ? (
                  <p className="font-body text-sm text-charcoal/60">
                    Your searched companies show up here.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((c) => {
                      const item = history.find(
                        (h) => h.company.toLowerCase() === c.toLowerCase() && h.verdict,
                      );
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => item && openFromHistory(item)}
                          className="neo-press rounded-md border-2 border-ink bg-sage/50 px-3 py-1 font-body text-xs font-bold text-ink"
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Live news */}
              <LiveNews />

              {/* Recent verdicts */}
              <div className="border-2 border-ink bg-charcoal p-5 shadow-hard">
                <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-paper">
                  <History className="h-5 w-5" /> Recent verdicts
                </h2>
                {history.length === 0 ? (
                  <p className="font-body text-sm text-sage">
                    Your past verdicts will show up here.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {history.map((h) => (
                      <li key={h.id}>
                        <button
                          type="button"
                          onClick={() => openFromHistory(h)}
                          disabled={!h.verdict}
                          className="flex w-full items-center justify-between border-2 border-ink bg-paper p-3 text-left enabled:hover:shadow-hard disabled:cursor-default"
                        >
                          <div>
                            <p className="font-display font-extrabold tracking-tight text-ink">
                              {h.company}
                            </p>
                            <p className="font-body text-xs text-charcoal/60">
                              {h.confidence}% · {h.riskLevel} risk
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border-2 border-ink px-2 py-1 font-body text-xs font-bold ${
                              h.decision === "INVEST"
                                ? "bg-brand text-ink"
                                : "bg-graphite text-paper"
                            }`}
                          >
                            {h.decision === "INVEST" ? (
                              <ThumbsUp className="h-3.5 w-3.5" />
                            ) : (
                              <ThumbsDown className="h-3.5 w-3.5" />
                            )}
                            {h.decision}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
