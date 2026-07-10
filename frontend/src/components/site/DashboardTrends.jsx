import { useMemo } from "react";
import { Activity, BarChart3, ThumbsDown, ThumbsUp, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const INK = "#171e19";
const BRAND = "#ffe17c";
const SAGE = "#b7c6c2";
const STAR = "#ffbc2e";

function StatTile({ label, value, icon, className = "" }) {
  return (
    <div className={`border-2 border-ink p-4 shadow-hard ${className}`}>
      <div className="flex items-center justify-between">
        <p className="font-body text-xs font-bold uppercase tracking-widest opacity-70">{label}</p>
        {icon}
      </div>
      <p className="mt-1 font-display text-3xl font-extrabold tracking-tighter">{value}</p>
    </div>
  );
}

export function DashboardTrends({ history }) {
  const stats = useMemo(() => {
    const total = history.length;
    const invest = history.filter((h) => h.decision === "INVEST").length;
    const pass = total - invest;
    const avgConf = total
      ? Math.round(history.reduce((a, h) => a + (h.confidence || 0), 0) / total)
      : 0;
    return { total, invest, pass, avgConf };
  }, [history]);

  const decisionData = useMemo(
    () => [
      { name: "Invest", value: stats.invest },
      { name: "Pass", value: stats.pass },
    ],
    [stats],
  );

  const confTrend = useMemo(
    () =>
      [...history]
        .reverse()
        .slice(-10)
        .map((h) => ({
          name: h.company.length > 8 ? `${h.company.slice(0, 8)}…` : h.company,
          confidence: h.confidence,
        })),
    [history],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Analyses"
          value={stats.total}
          icon={<Activity className="h-4 w-4" />}
          className="bg-paper text-ink"
        />
        <StatTile
          label="Invest"
          value={stats.invest}
          icon={<ThumbsUp className="h-4 w-4" />}
          className="bg-brand text-ink"
        />
        <StatTile
          label="Pass"
          value={stats.pass}
          icon={<ThumbsDown className="h-4 w-4" />}
          className="bg-charcoal text-paper"
        />
        <StatTile
          label="Avg confidence"
          value={`${stats.avgConf}%`}
          icon={<TrendingUp className="h-4 w-4" />}
          className="bg-sage text-ink"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border-2 border-ink bg-paper p-5 shadow-hard">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink">
            <BarChart3 className="h-5 w-5" /> Verdict split
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={decisionData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={SAGE} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: INK }} stroke={INK} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: INK }} stroke={INK} />
                <Tooltip
                  contentStyle={{ border: `2px solid ${INK}`, borderRadius: 0, fontSize: 12 }}
                />
                <Bar dataKey="value" stroke={INK} strokeWidth={2}>
                  <Cell fill={STAR} />
                  <Cell fill={SAGE} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border-2 border-ink bg-paper p-5 shadow-hard">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink">
            <TrendingUp className="h-5 w-5" /> Confidence trend
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={confTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={SAGE} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: INK }} stroke={INK} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: INK }} stroke={INK} />
                <Tooltip
                  contentStyle={{ border: `2px solid ${INK}`, borderRadius: 0, fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke={INK}
                  strokeWidth={3}
                  dot={{ fill: BRAND, stroke: INK, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
