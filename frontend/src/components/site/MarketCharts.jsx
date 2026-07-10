function _nullishCoalesce(lhs, rhsFn) {
  if (lhs != null) {
    return lhs;
  } else {
    return rhsFn();
  }
}
import { useMemo } from "react";
import {
  Activity,
  Building2,
  IndianRupee,
  Newspaper,
  PieChart as PieIcon,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const INK = "#171e19";
const BRAND = "#ffe17c";
const SAGE = "#b7c6c2";
const STAR = "#ffbc2e";

function Card({ title, icon, children, className = "" }) {
  return (
    <div className={`border-2 border-ink bg-paper p-5 shadow-hard ${className}`}>
      <h4 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}

const inr = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const crore = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L Cr`;
  return `₹${inr(n)} Cr`;
};

export function MarketCharts({ data }) {
  const priceUp = data.percentChange >= 0;
  const primaryPrice = _nullishCoalesce(
    _nullishCoalesce(data.currentPrice.nse, () => data.currentPrice.bse),
    () => 0,
  );

  const fin = useMemo(() => data.financialSeries.map((f) => ({ ...f })), [data.financialSeries]);
  const analyst = useMemo(
    () => data.analystRatings.filter((a) => a.count > 0),
    [data.analystRatings],
  );

  // 52-week position (0-100%)
  const range = data.yearHigh - data.yearLow;
  const pos = range > 0 ? ((primaryPrice - data.yearLow) / range) * 100 : 50;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 border-2 border-ink bg-brand px-3 py-1 font-body text-xs font-bold uppercase tracking-widest text-ink">
          <Activity className="h-3.5 w-3.5" /> Live market data · BSE / NSE
        </span>
      </div>

      {/* Price + 52w range */}
      <div className="border-2 border-ink bg-charcoal p-5 shadow-hard">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-body text-xs font-bold uppercase tracking-widest text-sage">
              {data.companyName} · {data.industry}
            </p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-display text-4xl font-extrabold tracking-tighter text-paper">
                ₹{inr(primaryPrice)}
              </span>
              <span
                className={`inline-flex items-center gap-1 border-2 border-ink px-2 py-0.5 font-body text-sm font-bold ${
                  priceUp ? "bg-brand text-ink" : "bg-star text-ink"
                }`}
              >
                {priceUp ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {priceUp ? "+" : ""}
                {data.percentChange.toFixed(2)}%
              </span>
            </div>
            <div className="mt-1 flex gap-4 font-body text-xs text-sage">
              {data.currentPrice.nse != null && <span>NSE ₹{inr(data.currentPrice.nse)}</span>}
              {data.currentPrice.bse != null && <span>BSE ₹{inr(data.currentPrice.bse)}</span>}
            </div>
          </div>
          <div className="w-full sm:w-72">
            <div className="mb-1 flex justify-between font-body text-xs font-bold text-sage">
              <span>52W Low ₹{inr(data.yearLow)}</span>
              <span>High ₹{inr(data.yearHigh)}</span>
            </div>
            <div className="relative h-3 border-2 border-ink bg-paper">
              <div
                className="h-full bg-star"
                style={{ width: `${Math.max(0, Math.min(100, pos))}%` }}
              />
              <div
                className="absolute -top-1 h-5 w-1.5 bg-brand"
                style={{ left: `${Math.max(0, Math.min(100, pos))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Net income growth */}
      {fin.length > 0 && (
        <Card title="Revenue & profit growth (₹ Cr)" icon={<IndianRupee className="h-5 w-5" />}>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={fin} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={SAGE} />
                <XAxis dataKey="year" tick={{ fontSize: 12, fill: INK }} stroke={INK} />
                <YAxis
                  tick={{ fontSize: 11, fill: INK }}
                  stroke={INK}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v) => crore(v)}
                  contentStyle={{ border: `2px solid ${INK}`, borderRadius: 0, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" name="Revenue" fill={STAR} stroke={INK} strokeWidth={2} />
                <Bar
                  dataKey="netIncome"
                  name="Net income"
                  fill={SAGE}
                  stroke={INK}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="grossProfit"
                  name="Gross profit"
                  stroke={INK}
                  strokeWidth={3}
                  dot={{ fill: INK, r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Growth metrics */}
        {data.growth.length > 0 && (
          <Card title="Growth rates (%)" icon={<TrendingUp className="h-5 w-5" />}>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.growth}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={SAGE} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: INK }} stroke={INK} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={70}
                    tick={{ fontSize: 11, fill: INK }}
                    stroke={INK}
                  />
                  <Tooltip
                    formatter={(v) => `${v.toFixed(2)}%`}
                    contentStyle={{ border: `2px solid ${INK}`, borderRadius: 0, fontSize: 12 }}
                  />
                  <Bar dataKey="value" stroke={INK} strokeWidth={2}>
                    {data.growth.map((g, i) => (
                      <Cell key={i} fill={g.value >= 0 ? STAR : SAGE} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Analyst ratings */}
        {analyst.length > 0 && (
          <Card title="Analyst recommendations" icon={<PieIcon className="h-5 w-5" />}>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyst}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    stroke={INK}
                    strokeWidth={2}
                    label={(e) => `${e.name}`}
                    labelLine={false}
                    fontSize={10}
                  >
                    {analyst.map((a, i) => (
                      <Cell key={i} fill={a.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [`${v} analysts`, n]}
                    contentStyle={{ border: `2px solid ${INK}`, borderRadius: 0, fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* Shareholding pattern over quarters */}
      {data.shareholding.length > 0 && (
        <Card title="Shareholding pattern (%)" icon={<Users className="h-5 w-5" />}>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.shareholding}
                margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={SAGE} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: INK }} stroke={INK} />
                <YAxis tick={{ fontSize: 11, fill: INK }} stroke={INK} />
                <Tooltip
                  formatter={(v) => `${v.toFixed(2)}%`}
                  contentStyle={{ border: `2px solid ${INK}`, borderRadius: 0, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="promoter"
                  name="Promoter"
                  stackId="1"
                  stroke={INK}
                  strokeWidth={2}
                  fill={STAR}
                />
                <Area
                  type="monotone"
                  dataKey="fii"
                  name="FII"
                  stackId="1"
                  stroke={INK}
                  strokeWidth={2}
                  fill={BRAND}
                />
                <Area
                  type="monotone"
                  dataKey="dii"
                  name="MF/DII"
                  stackId="1"
                  stroke={INK}
                  strokeWidth={2}
                  fill={SAGE}
                />
                <Area
                  type="monotone"
                  dataKey="public"
                  name="Public/Other"
                  stackId="1"
                  stroke={INK}
                  strokeWidth={2}
                  fill="#8fa39d"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Key ratios + risk */}
      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        {data.keyRatios.length > 0 && (
          <Card title="Key ratios" icon={<Building2 className="h-5 w-5" />}>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.keyRatios.map((r) => (
                <div key={r.label} className="border-2 border-ink bg-sage/40 p-3">
                  <dt className="font-body text-xs font-bold uppercase tracking-widest text-charcoal/60">
                    {r.label}
                  </dt>
                  <dd className="mt-0.5 font-body text-sm font-bold text-ink">{r.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}
        {data.riskMeter && (
          <Card title="Risk meter">
            <div className="flex flex-col items-center justify-center gap-2 py-3">
              <div className="font-display text-3xl font-extrabold tracking-tighter text-ink">
                {data.riskMeter.stdDev.toFixed(1)}
              </div>
              <span className="border-2 border-ink bg-star px-3 py-1 font-body text-xs font-bold uppercase text-ink">
                {data.riskMeter.category}
              </span>
              <p className="text-center font-body text-xs text-charcoal/60">
                Volatility (std. dev.)
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Latest news with links */}
      {data.news.length > 0 && (
        <Card title="Latest company news" icon={<Newspaper className="h-5 w-5" />}>
          <ul className="space-y-2">
            {data.news.map((n, i) => (
              <li key={i} className="border-2 border-ink bg-paper p-3">
                <a
                  href={n.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="font-display font-extrabold tracking-tight text-ink underline-offset-2 hover:underline"
                >
                  {n.title}
                </a>
                {n.date && <p className="mt-0.5 font-body text-xs text-charcoal/60">{n.date}</p>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
