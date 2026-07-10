import { useEffect, useState } from "react";
import { Fuel, Gem, Loader2, Radio, TrendingDown, TrendingUp } from "lucide-react";

import { api } from "@/lib/api";

const ICONS = {
  gold: <Gem className="h-4 w-4" />,
  silver: <Gem className="h-4 w-4" />,
  crude: <Fuel className="h-4 w-4" />,
  natgas: <Fuel className="h-4 w-4" />,
  copper: <Gem className="h-4 w-4" />,
};

/**
 * Live commodities market-watch rail (Gold, Silver, Crude Oil, etc.).
 * Auto-refreshes so clients see moving prices while reading the report.
 */
export function MarketWatch() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await api.get("/api/public/market/commodities");
        if (!active) return;
        setItems(res.data.commodities ?? []);
        setPulse(true);
        setTimeout(() => active && setPulse(false), 700);
      } catch {
        /* ignore */
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const t = setInterval(load, 30_000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="border-2 border-ink bg-charcoal p-4 shadow-hard">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="flex items-center gap-2 font-display text-base font-extrabold tracking-tight text-paper">
          <Radio className="h-4 w-4 text-brand" /> Live market watch
        </h4>
        <span
          className={`inline-flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-widest ${
            pulse ? "text-brand" : "text-sage"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${pulse ? "bg-brand" : "bg-sage"} animate-pulse`}
          />
          MCX
        </span>
      </div>

      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-sage" />
        </div>
      ) : items.length === 0 ? (
        <p className="py-6 text-center font-body text-xs text-sage">
          Live prices unavailable right now.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((c) => {
            const up = c.change >= 0;
            return (
              <li
                key={c.key}
                className="border-2 border-ink bg-paper p-3 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center border-2 border-ink bg-brand text-ink">
                      {ICONS[c.key] ?? <Gem className="h-4 w-4" />}
                    </span>
                    <span className="truncate font-display text-sm font-extrabold tracking-tight text-ink">
                      {c.label}
                    </span>
                  </span>
                  <span
                    className={`inline-flex shrink-0 items-center gap-0.5 border-2 border-ink px-1.5 py-0.5 font-body text-[11px] font-bold ${
                      up ? "bg-brand text-ink" : "bg-graphite text-paper"
                    }`}
                  >
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {up ? "+" : ""}
                    {c.percentChange.toFixed(2)}%
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-display text-lg font-extrabold tracking-tighter text-ink">
                    ₹{c.price.toLocaleString("en-IN")}
                  </span>
                  <span className="font-body text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                    /{c.unit || "unit"}
                  </span>
                </div>
                <div className="mt-1 font-body text-[10px] font-medium text-charcoal/60">
                  H ₹{c.high.toLocaleString("en-IN")} · L ₹{c.low.toLocaleString("en-IN")}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
