import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  Download,
  Minus,
  Newspaper,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { MarketCharts } from "@/components/site/MarketCharts";

import { downloadVerdictReport } from "@/lib/report";

const INK = "#171e19";
const BRAND = "#ffe17c";
const SAGE = "#b7c6c2";
const STAR = "#ffbc2e";

function RiskPill({ level }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-paper px-3 py-1 font-body text-xs font-bold uppercase text-ink">
      <ShieldAlert className="h-3.5 w-3.5" />
      {level} risk
    </span>
  );
}

function SectionCard({ title, icon, children, className = "" }) {
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

function sentimentStyle(s) {
  if (s === "positive") return { chip: "bg-brand text-ink", Icon: ArrowUpRight, label: "Positive" };
  if (s === "negative")
    return { chip: "bg-charcoal text-paper", Icon: ArrowDownRight, label: "Negative" };
  return { chip: "bg-sage text-ink", Icon: Minus, label: "Neutral" };
}

export function VerdictReport({ verdict }) {
  const isInvest = verdict.decision === "INVEST";

  const finData = useMemo(
    () => verdict.financialSeries.map((p) => ({ ...p })),
    [verdict.financialSeries],
  );
  const scoreData = useMemo(
    () => verdict.scoreBreakdown.map((s) => ({ ...s })),
    [verdict.scoreBreakdown],
  );

  return (
    <div className="space-y-5 text-left">
      {/* Decision banner */}
      <div
        className={`flex flex-col gap-4 border-2 border-ink p-6 shadow-hard-lg sm:flex-row sm:items-center sm:justify-between ${
          isInvest ? "bg-brand" : "bg-charcoal"
        }`}
      >
        <div>
          <p
            className={`font-body text-xs font-bold uppercase tracking-widest ${
              isInvest ? "text-charcoal/70" : "text-sage"
            }`}
          >
            Verdict on {verdict.company}
          </p>
          <div className="mt-1 flex items-center gap-3">
            {isInvest ? (
              <ThumbsUp className="h-9 w-9 text-ink" />
            ) : (
              <ThumbsDown className="h-9 w-9 text-paper" />
            )}
            <span
              className={`font-display text-5xl font-extrabold tracking-tighter ${
                isInvest ? "text-ink" : "text-paper"
              }`}
            >
              {verdict.decision}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <div className="flex items-center gap-2">
            <RiskPill level={verdict.riskLevel} />
            <button
              type="button"
              onClick={() => downloadVerdictReport(verdict)}
              className="neo-press inline-flex items-center gap-1.5 rounded-lg border-2 border-ink bg-paper px-3 py-1.5 font-body text-xs font-bold text-ink"
            >
              <Download className="h-3.5 w-3.5" /> PDF report
            </button>
          </div>
          <div
            className={`font-body text-sm font-bold ${isInvest ? "text-charcoal" : "text-paper"}`}
          >
            Confidence: {verdict.confidence}%
          </div>
          <div className="h-3 w-40 border-2 border-ink bg-paper">
            <div className="h-full bg-star" style={{ width: `${verdict.confidence}%` }} />
          </div>
        </div>
      </div>

      {/* Live market price */}
      {verdict.liveQuote &&
        verdict.liveQuote.price > 0 &&
        (() => {
          const q = verdict.liveQuote;
          const up = q.change >= 0;
          const fmt = (n) =>
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: q.currency || "USD",
              maximumFractionDigits: 2,
            }).format(n);
          return (
            <div className="border-2 border-ink bg-charcoal p-5 shadow-hard">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 font-body text-xs font-bold uppercase tracking-widest text-sage">
                    <span className="inline-flex h-2 w-2 animate-pulse bg-star" />
                    Live price · {q.symbol}
                    {q.exchange ? ` · ${q.exchange}` : ""}
                  </p>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="font-display text-4xl font-extrabold tracking-tighter text-paper">
                      {fmt(q.price)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 border-2 border-ink px-2 py-0.5 font-body text-sm font-bold ${
                        up ? "bg-brand text-ink" : "bg-star text-ink"
                      }`}
                    >
                      {up ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {up ? "+" : ""}
                      {fmt(q.change)} ({up ? "+" : ""}
                      {q.percentChange.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-right font-body text-sm text-paper sm:grid-cols-4">
                  {[
                    ["Open", q.open],
                    ["High", q.high],
                    ["Low", q.low],
                    ["Prev close", q.previousClose],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs font-bold uppercase tracking-widest text-sage">{k}</dt>
                      <dd className="font-bold text-paper">{fmt(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          );
        })()}

      {/* Live Indian market charts (BSE/NSE) */}
      {verdict.marketData && <MarketCharts data={verdict.marketData} />}

      {/* Company overview */}
      <SectionCard title="Company overview">
        {verdict.overview.oneLiner && (
          <p className="mb-4 font-body font-medium text-charcoal">{verdict.overview.oneLiner}</p>
        )}
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ["Sector", verdict.overview.sector],
            ["Headquarters", verdict.overview.headquarters],
            ["Founded", verdict.overview.founded],
            ["Employees", verdict.overview.employees],
            ["CEO", verdict.overview.ceo],
          ].map(([k, v]) => (
            <div key={k} className="border-2 border-ink bg-sage/40 p-3">
              <dt className="font-body text-xs font-bold uppercase tracking-widest text-charcoal/60">
                {k}
              </dt>
              <dd className="mt-0.5 font-body text-sm font-bold text-ink">{v || "—"}</dd>
            </div>
          ))}
        </dl>
      </SectionCard>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {finData.length > 0 && (
          <SectionCard title="Financial overview ($B)">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={finData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={SAGE} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: INK }} stroke={INK} />
                  <YAxis tick={{ fontSize: 12, fill: INK }} stroke={INK} />
                  <Tooltip
                    contentStyle={{
                      border: `2px solid ${INK}`,
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="revenue" name="Revenue" fill={STAR} stroke={INK} strokeWidth={2} />
                  <Bar
                    dataKey="netIncome"
                    name="Net income"
                    fill={INK}
                    stroke={INK}
                    strokeWidth={2}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        )}

        {scoreData.length > 0 && (
          <SectionCard title="Score breakdown">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={scoreData} outerRadius="72%">
                  <PolarGrid stroke={SAGE} />
                  <PolarAngleAxis dataKey="label" tick={{ fontSize: 11, fill: INK }} />
                  <Radar
                    dataKey="score"
                    stroke={INK}
                    strokeWidth={2}
                    fill={BRAND}
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      border: `2px solid ${INK}`,
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        )}
      </div>

      {/* Score bars (explicit numbers) */}
      {scoreData.length > 0 && (
        <SectionCard title="Category scores">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={scoreData}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={SAGE} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: INK }}
                  stroke={INK}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={80}
                  tick={{ fontSize: 12, fill: INK }}
                  stroke={INK}
                />
                <Tooltip
                  contentStyle={{ border: `2px solid ${INK}`, borderRadius: 0, fontSize: 12 }}
                />
                <Bar dataKey="score" stroke={INK} strokeWidth={2} radius={0}>
                  {scoreData.map((s, i) => (
                    <Cell key={i} fill={s.score >= 60 ? STAR : SAGE} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}

      {/* Thesis */}
      <div className="border-2 border-ink bg-sage p-5 shadow-hard">
        <h4 className="mb-1 font-display text-lg font-extrabold tracking-tight text-ink">
          The thesis
        </h4>
        <p className="font-body font-medium text-charcoal">{verdict.thesis}</p>
      </div>

      {/* Bull / Bear */}
      <div className="grid gap-4 md:grid-cols-2">
        <SectionCard title="Bull case" icon={<ThumbsUp className="h-5 w-5" />}>
          <ul className="space-y-2">
            {verdict.bullCase.map((p, i) => (
              <li key={i} className="flex gap-2 font-body text-sm text-charcoal">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Bear case" icon={<ThumbsDown className="h-5 w-5" />}>
          <ul className="space-y-2">
            {verdict.bearCase.map((p, i) => (
              <li key={i} className="flex gap-2 font-body text-sm text-charcoal">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      {/* Latest news */}
      {verdict.news.length > 0 && (
        <SectionCard title="Latest news" icon={<Newspaper className="h-5 w-5" />}>
          <ul className="space-y-3">
            {verdict.news.map((n, i) => {
              const { chip, Icon, label } = sentimentStyle(n.sentiment);
              return (
                <li key={i} className="border-2 border-ink bg-paper p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-display font-extrabold tracking-tight text-ink">{n.title}</p>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-md border-2 border-ink px-2 py-0.5 font-body text-[10px] font-bold uppercase ${chip}`}
                    >
                      <Icon className="h-3 w-3" /> {label}
                    </span>
                  </div>
                  <p className="mt-1 font-body text-sm text-charcoal">{n.summary}</p>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      )}

      {/* Key metrics */}
      {verdict.keyMetrics.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {verdict.keyMetrics.map((m) => (
            <div key={m.label} className="border-2 border-ink bg-paper p-4 shadow-hard">
              <p className="font-body text-xs font-bold uppercase tracking-widest text-charcoal/60">
                {m.label}
              </p>
              <p className="mt-1 font-body font-bold text-ink">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Research trail — engaging redesign */}
      <div className="border-2 border-ink bg-brand/40 p-5 shadow-hard-lg sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 border-2 border-ink bg-paper px-3 py-1 font-body text-[11px] font-bold uppercase tracking-widest text-ink shadow-hard">
              <TrendingUp className="h-3.5 w-3.5" /> Deep dive
            </span>
            <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              The research behind the call
            </h3>
            <p className="mt-1 font-body text-sm font-medium text-charcoal">
              Revenue trajectory, live commodity markets, and the full analyst breakdown.
            </p>
          </div>
        </div>

        {/* Growth curve */}
        {verdict.financialSeries.length > 0 && (
          <div className="mb-5 border-2 border-ink bg-paper p-4 shadow-hard">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-ink" />
              <h4 className="font-display text-base font-extrabold tracking-tight text-ink">
                Revenue growth curve
              </h4>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={verdict.financialSeries}
                  margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={STAR} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={BRAND} stopOpacity={0.15} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={SAGE} />
                  <XAxis dataKey="year" tick={{ fontSize: 12, fill: INK }} stroke={INK} />
                  <YAxis tick={{ fontSize: 12, fill: INK }} stroke={INK} />
                  <Tooltip
                    contentStyle={{ border: `2px solid ${INK}`, borderRadius: 0, fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={INK}
                    strokeWidth={3}
                    fill="url(#growthFill)"
                    dot={{ fill: BRAND, stroke: INK, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: STAR, stroke: INK, strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="netIncome"
                    name="Net income"
                    stroke={INK}
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    fill="none"
                    dot={false}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Research cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Company profile",
              verdict.research.profile,
              <Building2 key="i" className="h-4 w-4" />,
              "bg-brand",
            ],
            [
              "Financials",
              verdict.research.financials,
              <BarChart3 key="i" className="h-4 w-4" />,
              "bg-sage",
            ],
            [
              "Risks & moat",
              verdict.research.risks,
              <ShieldAlert key="i" className="h-4 w-4" />,
              "bg-star",
            ],
          ].map(([title, body, icon, tone]) => (
            <div
              key={title}
              className="flex flex-col overflow-hidden border-2 border-ink bg-paper shadow-hard transition-transform hover:-translate-y-0.5"
            >
              <div className={`flex items-center gap-2 border-b-2 border-ink px-3 py-2 ${tone}`}>
                <span className="grid h-6 w-6 place-items-center border-2 border-ink bg-paper text-ink">
                  {icon}
                </span>
                <h4 className="font-display text-sm font-extrabold uppercase tracking-tight text-ink">
                  {title}
                </h4>
              </div>
              <p className="max-h-64 overflow-y-auto p-3 font-body text-[13px] leading-relaxed text-charcoal">
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="font-body text-xs text-charcoal/60">
        Financial figures and news are AI-generated estimates for illustration only — not financial
        advice.
      </p>
    </div>
  );
}
