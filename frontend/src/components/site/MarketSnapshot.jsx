import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "@/lib/api";

const INK = "#171e19";
const STAR = "#ffbc2e";
const SAGE = "#b7c6c2";

function MoverChart({ data, up }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={SAGE} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: INK }} stroke={INK} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fontSize: 10, fill: INK }}
            stroke={INK}
          />
          <Tooltip
            formatter={(v) => `${v.toFixed(2)}%`}
            contentStyle={{ border: `2px solid ${INK}`, borderRadius: 0, fontSize: 12 }}
          />
          <Bar dataKey="change" stroke={INK} strokeWidth={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={up ? STAR : SAGE} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MarketSnapshot() {
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get("/api/public/market/trending")
      .then((res) => {
        if (!active) return;
        setGainers(res.data.gainers ?? []);
        setLosers(res.data.losers ?? []);
        setLoaded(true);
      })
      .catch(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="border-b-2 border-ink bg-sage">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-block border-2 border-ink bg-paper px-3 py-1 font-body text-xs font-bold uppercase tracking-widest text-ink shadow-hard">
              Live · BSE / NSE
            </span>
            <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tighter text-ink sm:text-5xl">
              The market, charted.
            </h2>
            <p className="mt-3 max-w-lg font-body text-lg font-medium text-charcoal">
              Every verdict comes with real financials, growth charts, analyst recommendations and
              shareholding trends — powered by live Indian market data.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="neo-press inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-ink px-6 py-3 font-body font-bold text-paper"
          >
            Research a stock <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border-2 border-ink bg-paper p-5 shadow-hard-lg">
            <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-ink">
              <TrendingUp className="h-5 w-5" /> Top gainers today
            </h3>
            {loaded && gainers.length > 0 ? (
              <MoverChart data={gainers} up />
            ) : (
              <p className="py-16 text-center font-body text-sm text-charcoal/60">
                {loaded ? "Market data updating…" : "Loading live movers…"}
              </p>
            )}
          </div>
          <div className="border-2 border-ink bg-charcoal p-5 shadow-hard-lg">
            <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-paper">
              <TrendingDown className="h-5 w-5" /> Top losers today
            </h3>
            {loaded && losers.length > 0 ? (
              <div className="bg-paper p-2">
                <MoverChart data={losers} up={false} />
              </div>
            ) : (
              <p className="py-16 text-center font-body text-sm text-sage">
                {loaded ? "Market data updating…" : "Loading live movers…"}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
