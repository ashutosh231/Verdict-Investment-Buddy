import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { api } from "@/lib/api";

/**
 * A continuously scrolling ticker of live market movers.
 * Falls back to a static row while data loads.
 */
export function LiveTicker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    api
      .get("/api/public/market/trending")
      .then((res) => {
        if (!active) return;
        const merged = [...(res.data.gainers ?? []), ...(res.data.losers ?? [])].filter(
          (m) => m.name,
        );
        setItems(merged);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex h-11 items-center overflow-hidden border-b-2 border-ink bg-ink px-4">
        <span className="font-body text-xs font-bold uppercase tracking-widest text-brand">
          Live · BSE / NSE · streaming market data…
        </span>
      </div>
    );
  }

  const loop = [...items, ...items];

  return (
    <div className="group relative flex h-11 items-center overflow-hidden border-b-2 border-ink bg-ink">
      <div className="flex shrink-0 animate-marquee items-center whitespace-nowrap group-hover:[animation-play-state:paused]">
        {loop.map((m, i) => {
          const up = m.change >= 0;
          return (
            <span
              key={`${m.name}-${i}`}
              className="mx-4 inline-flex items-center gap-2 font-body text-sm font-bold text-paper"
            >
              <span className="text-brand">{m.name}</span>
              <span>₹{m.price.toLocaleString("en-IN")}</span>
              <span
                className={`inline-flex items-center gap-0.5 ${up ? "text-star" : "text-sage"}`}
              >
                {up ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {up ? "+" : ""}
                {m.change.toFixed(2)}%
              </span>
              <span className="text-paper/30">•</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
