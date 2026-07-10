// Indian Stock Exchange API (BSE/NSE) — data fetch + normalize.
// Reads INDIAN_STOCK_API_KEY. Returns clean DTOs for charts.

const BASE = "https://stock.indianapi.in";

const num = (v) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

function pick(items, key) {
  if (!items) return 0;
  const hit = items.find((i) => i.key === key);
  return hit ? num(hit.value) : 0;
}

export async function getIndianStock(company) {
  const token = process.env.INDIAN_STOCK_API_KEY;
  if (!token) {
    console.warn("INDIAN_STOCK_API_KEY not set — skipping Indian market data");
    return null;
  }

  try {
    const res = await fetch(`${BASE}/stock?name=${encodeURIComponent(company.trim())}`, {
      headers: { "X-Api-Key": token },
    });
    if (!res.ok) {
      console.warn("Indian stock API non-OK", res.status);
      return null;
    }
    const d = await res.json();
    if (!d || !d.companyName) return null;

    // --- Prices ---
    const cp = d.currentPrice ?? {};
    const bse = cp.BSE != null ? num(cp.BSE) : null;
    const nse = cp.NSE != null ? num(cp.NSE) : null;

    // --- Annual financial series (₹ crore) ---
    const fins = Array.isArray(d.financials) ? d.financials : [];
    const annual = fins
      .filter((f) => String(f.Type).toLowerCase() === "annual")
      .slice(0, 6)
      .map((f) => {
        const inc = f.stockFinancialMap?.INC;
        return {
          year: String(f.FiscalYear),
          revenue: pick(inc, "Revenue") || pick(inc, "TotalRevenue"),
          netIncome: pick(inc, "NetIncome"),
          grossProfit: pick(inc, "GrossProfit"),
        };
      })
      .filter((x) => x.revenue > 0)
      .reverse(); // oldest -> newest

    // --- Growth metrics ---
    const km = d.keyMetrics ?? {};
    const growthKeys = [
      ["revenueGrowthRate5Year", "Revenue 5Y"],
      ["ePSGrowthRate5Year", "EPS 5Y"],
      ["ePSChangePercentTTMOverTTM", "EPS TTM"],
      ["revenueChangePercentMostRecentQuarter1YearAgo", "Rev QoQ"],
    ];
    const growth = growthKeys
      .map(([key, label]) => {
        const hit = (km.growth ?? []).find((x) => x.key === key);
        return hit ? { label, value: num(hit.value) } : null;
      })
      .filter((x) => x != null);

    // --- Analyst ratings ---
    const av = Array.isArray(d.analystView) ? d.analystView : [];
    const analystRatings = av
      .map((a) => ({
        name: String(a.ratingName ?? ""),
        count: num(a.numberOfAnalystsLatest),
        color: String(a.colorCode ?? "#898989"),
      }))
      .filter((a) => a.name);

    // --- Shareholding across quarters (stacked) ---
    const shList = Array.isArray(d.shareholding) ? d.shareholding : [];
    const dates = new Set();
    for (const s of shList) for (const c of s.categories ?? []) dates.add(c.holdingDate);
    const sortedDates = [...dates].sort();
    const shareholding = sortedDates.map((date) => {
      const row = {
        date: date.slice(0, 7),
        promoter: 0,
        fii: 0,
        dii: 0,
        public: 0,
      };
      for (const s of shList) {
        const val = num(s.categories?.find((c) => c.holdingDate === date)?.percentage);
        const dn = s.displayName.toLowerCase();
        if (dn.includes("promoter")) row.promoter = val;
        else if (dn.includes("fii")) row.fii = val;
        else if (dn.includes("mf")) row.dii = val;
        else row.public += val;
      }
      return row;
    });

    // --- Risk meter ---
    const rm = d.riskMeter ?? null;
    const riskMeter = rm
      ? { category: String(rm.categoryName ?? "—"), stdDev: num(rm.stdDev) }
      : null;

    // --- Key ratios snapshot ---
    const findVal = (arr, key) => {
      const hit = arr?.find((x) => x.key === key);
      return hit ? hit.value : "—";
    };
    const keyRatios = [
      { label: "P/E (TTM)", value: findVal(km.valuation, "pPerEIncludingExtraordinaryItemsTTM") },
      { label: "P/B", value: findVal(km.valuation, "priceToBookMostRecentFiscalYear") },
      { label: "Dividend yield", value: `${findVal(km.valuation, "currentDividendYieldCommonStockPrimaryIssueLTM")}%` },
      { label: "Net margin", value: `${findVal(km.margins, "netProfitMarginPercentTrailing12Month")}%` },
      { label: "Gross margin", value: `${findVal(km.margins, "grossMargin1stHistoricalFiscalYear")}%` },
      { label: "EPS (TTM)", value: findVal(km.persharedata, "ePSIncludingExtraOrdinaryItemsTrailing12Month") },
    ].filter((r) => r.value && r.value !== "—" && r.value !== "—%");

    // --- Recent news ---
    const rn = Array.isArray(d.recentNews) ? d.recentNews : [];
    const news = rn
      .slice(0, 5)
      .map((n) => {
        const rawUrl = String(n.url ?? "");
        const url = rawUrl.startsWith("http")
          ? rawUrl
          : rawUrl
            ? `https://www.livemint.com${rawUrl}`
            : "";
        return {
          title: String(n.headline ?? ""),
          url,
          date: String(n.date ?? "").slice(0, 10),
        };
      })
      .filter((n) => n.title);

    return {
      companyName: String(d.companyName),
      industry: String(d.industry ?? "—"),
      description: String(d.companyProfile?.companyDescription ?? "").slice(0, 600),
      currentPrice: { bse, nse },
      percentChange: num(d.percentChange),
      yearHigh: num(d.yearHigh),
      yearLow: num(d.yearLow),
      financialSeries: annual,
      growth,
      analystRatings,
      shareholding,
      riskMeter,
      keyRatios,
      news,
    };
  } catch (err) {
    console.error("getIndianStock error", err);
    return null;
  }
}
