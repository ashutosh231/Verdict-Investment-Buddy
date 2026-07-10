import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { api } from "@/lib/api";

const INK = "#171e19";
const STAR = "#ffbc2e";
const SAGE = "#b7c6c2";

function MoverChart({ data, up }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 44, left: 4, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={108}
            tick={{ fontSize: 10, fill: INK }}
            stroke={INK}
          />
          <Tooltip
            formatter={(v) => `${Number(v).toFixed(2)}%`}
            contentStyle={{ border: `2px solid ${INK}`, borderRadius: 0, fontSize: 12 }}
          />
          <Bar dataKey="change" stroke={INK} strokeWidth={2} radius={0}>
            {data.map((_, i) => (
              <Cell key={i} fill={up ? STAR : SAGE} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MarketMovers() {
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
    <div className="grid gap-6 md:grid-cols-2">
      <div className="border-2 border-ink bg-paper p-5 shadow-hard">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink">
          <TrendingUp className="h-5 w-5" /> Top gainers
        </h3>
        {loaded && gainers.length > 0 ? (
          <MoverChart data={gainers} up />
        ) : (
          <p className="py-14 text-center font-body text-sm text-charcoal/60">
            {loaded ? "Updating…" : "Loading movers…"}
          </p>
        )}
      </div>
      <div className="border-2 border-ink bg-charcoal p-5 shadow-hard">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-paper">
          <TrendingDown className="h-5 w-5" /> Top losers
        </h3>
        {loaded && losers.length > 0 ? (
          <div className="bg-paper p-2">
            <MoverChart data={losers} up={false} />
          </div>
        ) : (
          <p className="py-14 text-center font-body text-sm text-sage">
            {loaded ? "Updating…" : "Loading movers…"}
          </p>
        )}
      </div>
    </div>
  );
}
