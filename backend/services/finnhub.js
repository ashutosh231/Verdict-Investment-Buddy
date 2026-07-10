// Live stock pricing via Finnhub. Reads FINNHUB_API_KEY.

const BASE = "https://finnhub.io/api/v1";

async function resolveSymbol(query, token) {
  const clean = query.trim();
  if (!clean) return null;

  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(clean)}&token=${token}`);
  if (!res.ok) return null;
  const data = await res.json();
  const results = data.result ?? [];
  if (results.length === 0) return null;

  // Prefer plain US-style tickers (no dot/colon) that look like common stock.
  const preferred =
    results.find((r) => r.type === "Common Stock" && /^[A-Z.]{1,6}$/.test(r.symbol)) ??
    results.find((r) => /^[A-Z.]{1,6}$/.test(r.symbol)) ??
    results[0];

  return { symbol: preferred.symbol, name: preferred.description || clean };
}

export async function getLiveQuote(company) {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    console.warn("FINNHUB_API_KEY not set — skipping live quote");
    return null;
  }

  try {
    const resolved = await resolveSymbol(company, token);
    if (!resolved) return null;

    const [quoteRes, profileRes] = await Promise.all([
      fetch(`${BASE}/quote?symbol=${encodeURIComponent(resolved.symbol)}&token=${token}`),
      fetch(`${BASE}/stock/profile2?symbol=${encodeURIComponent(resolved.symbol)}&token=${token}`),
    ]);

    if (!quoteRes.ok) return null;
    const q = await quoteRes.json();

    // A zeroed-out quote means the symbol has no live data.
    if (!q || (q.c === 0 && q.pc === 0)) return null;

    let currency = "USD";
    let exchange = "";
    let name = resolved.name;
    if (profileRes.ok) {
      const p = await profileRes.json();
      currency = p.currency || currency;
      exchange = p.exchange || exchange;
      name = p.name || name;
    }

    return {
      symbol: resolved.symbol,
      name,
      price: q.c ?? 0,
      change: q.d ?? 0,
      percentChange: q.dp ?? 0,
      high: q.h ?? 0,
      low: q.l ?? 0,
      open: q.o ?? 0,
      previousClose: q.pc ?? 0,
      currency,
      exchange,
    };
  } catch (err) {
    console.error("getLiveQuote error", err);
    return null;
  }
}
