import { asyncHandler } from "../utils/asyncHandler.js";

const normStocks = (arr) =>
  (Array.isArray(arr) ? arr : [])
    .slice(0, 6)
    .map((s) => ({
      name: String(s.company_name ?? "").slice(0, 22),
      price: Number(s.price) || 0,
      change: Number(s.percent_change) || 0,
    }))
    .filter((s) => s.name);

export const trending = asyncHandler(async (req, res) => {
  const token = process.env.INDIAN_STOCK_API_KEY;
  if (!token) return res.json({ gainers: [], losers: [] });
  try {
    const r = await fetch("https://stock.indianapi.in/trending", {
      headers: { "X-Api-Key": token },
    });
    if (!r.ok) return res.json({ gainers: [], losers: [] });
    const d = await r.json();
    const t = d.trending_stocks ?? {};
    res.set("Cache-Control", "public, max-age=300");
    return res.json({ gainers: normStocks(t.top_gainers), losers: normStocks(t.top_losers) });
  } catch (err) {
    console.error("trending fetch error", err);
    return res.json({ gainers: [], losers: [] });
  }
});

export const news = asyncHandler(async (req, res) => {
  const token = process.env.INDIAN_STOCK_API_KEY;
  if (!token) return res.json({ news: [] });
  try {
    const r = await fetch("https://stock.indianapi.in/news", {
      headers: { "X-Api-Key": token },
    });
    if (!r.ok) return res.json({ news: [] });
    const raw = await r.json();
    const news = (Array.isArray(raw) ? raw : [])
      .slice(0, 12)
      .map((n) => ({
        title: String(n.title ?? "").slice(0, 160),
        summary: String(n.summary ?? "").slice(0, 220),
        url: String(n.url ?? ""),
        image: String(n.image_url ?? ""),
        source: String(n.source ?? "Market"),
        date: String(n.pub_date ?? ""),
      }))
      .filter((n) => n.title);
    res.set("Cache-Control", "public, max-age=300");
    return res.json({ news });
  } catch (err) {
    console.error("news fetch error", err);
    return res.json({ news: [] });
  }
});

// Which products we surface + friendly labels, in display order.
const WANTED = [
  { product: "GOLD", key: "gold", label: "Gold" },
  { product: "SILVER", key: "silver", label: "Silver" },
  { product: "CRUDEOIL", key: "crude", label: "Crude Oil" },
  { product: "NATURALGAS", key: "natgas", label: "Natural Gas" },
  { product: "COPPER", key: "copper", label: "Copper" },
];

export const commodities = asyncHandler(async (req, res) => {
  const token = process.env.INDIAN_STOCK_API_KEY;
  if (!token) return res.json({ commodities: [] });
  try {
    const r = await fetch("https://stock.indianapi.in/commodities", {
      headers: { "X-Api-Key": token },
    });
    if (!r.ok) return res.json({ commodities: [] });
    const data = await r.json();
    const rows = Array.isArray(data) ? data : [];

    const commodities = [];
    for (const w of WANTED) {
      const hit = rows.find((x) => x.product === w.product);
      if (!hit) continue;
      commodities.push({
        key: w.key,
        label: w.label,
        unit: hit.price_quotation_unit ?? "",
        price: Number(hit.last_traded_price) || 0,
        change: Number(hit.change) || 0,
        percentChange: Number(hit.per_change) || 0,
        high: Number(hit.high_price) || 0,
        low: Number(hit.low_price) || 0,
      });
    }

    res.set("Cache-Control", "public, max-age=120");
    return res.json({ commodities });
  } catch (err) {
    console.error("commodities fetch error", err);
    return res.json({ commodities: [] });
  }
});
