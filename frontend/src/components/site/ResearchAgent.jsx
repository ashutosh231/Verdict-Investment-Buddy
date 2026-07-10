import { useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Loader2, Search, TrendingUp } from "lucide-react";

import { api, apiError } from "@/lib/api";

const STEPS = [
  "Building company profile…",
  "Analyzing financial health…",
  "Assessing risks & moat…",
  "Reaching a verdict…",
];

// Curated set of well-known companies for instant typeahead suggestions.
const COMPANIES = [
  "Reliance Industries",
  "Tata Consultancy Services",
  "HDFC Bank",
  "Infosys",
  "ICICI Bank",
  "Bharti Airtel",
  "State Bank of India",
  "Larsen & Toubro",
  "Wipro",
  "HCL Technologies",
  "Tech Mahindra",
  "Adani Enterprises",
  "Tata Motors",
  "Maruti Suzuki",
  "Titan Company",
  "Asian Paints",
  "Bajaj Finance",
  "Hindustan Unilever",
  "ITC",
  "Sun Pharma",
  "Cipla",
  "Nestle India",
  "Zomato",
  "Paytm",
  "Nvidia",
  "Apple",
  "Microsoft",
  "Alphabet",
  "Amazon",
  "Meta Platforms",
  "Tesla",
  "Netflix",
  "Spotify",
  "AMD",
  "Intel",
  "Palantir",
  "Uber",
  "Airbnb",
  "Coca-Cola",
  "Visa",
];

export function ResearchAgent({ onResult, onComplete }) {
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const blurTimer = useRef(undefined);

  const suggestions = useMemo(() => {
    const q = company.trim().toLowerCase();
    if (!q) return [];
    const starts = COMPANIES.filter((c) => c.toLowerCase().startsWith(q));
    const contains = COMPANIES.filter(
      (c) => !c.toLowerCase().startsWith(q) && c.toLowerCase().includes(q),
    );
    const merged = [...starts, ...contains].slice(0, 6);
    // Hide if the only match is exactly what's typed.
    if (merged.length === 1 && merged[0].toLowerCase() === q) return [];
    return merged;
  }, [company]);

  const showList = open && suggestions.length > 0 && !loading;

  async function runResearch(name) {
    const target = name.trim();
    if (!target || loading) return;
    setOpen(false);
    setActive(-1);
    setLoading(true);
    setError(null);
    setStep(0);

    const timer = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 1500);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000);

    try {
      const res = await api.post(
        "/api/research",
        { company: target },
        { signal: controller.signal },
      );
      onResult?.(res.data.verdict);
      onComplete?.();
    } catch (err) {
      if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
        setError("The agent took too long to respond. Please try again.");
      } else {
        setError(apiError(err, "Couldn't reach the research agent. Please try again."));
      }
    } finally {
      clearInterval(timer);
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    if (showList && active >= 0) {
      const pick = suggestions[active];
      setCompany(pick);
      runResearch(pick);
      return;
    }
    runResearch(company);
  }

  function onKeyDown(e) {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? suggestions.length - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  function selectSuggestion(name) {
    setCompany(name);
    setOpen(false);
    setActive(-1);
    runResearch(name);
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/50" />
          <input
            value={company}
            onChange={(e) => {
              setCompany(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              // Delay so a click on a suggestion registers first.
              blurTimer.current = setTimeout(() => setOpen(false), 120);
            }}
            onKeyDown={onKeyDown}
            placeholder="Enter a company (e.g. Nvidia, Spotify, Tesla)"
            disabled={loading}
            autoComplete="off"
            role="combobox"
            aria-expanded={showList}
            aria-autocomplete="list"
            className="w-full rounded-xl border-2 border-ink bg-paper py-3.5 pl-11 pr-4 font-body font-medium text-ink shadow-hard outline-none placeholder:text-charcoal/50 focus:shadow-hard-lg disabled:opacity-60"
          />

          {showList && (
            <ul className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border-2 border-ink bg-paper shadow-hard-lg">
              {suggestions.map((s, i) => (
                <li key={s}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      // Prevent input blur before click handler runs.
                      e.preventDefault();
                      if (blurTimer.current) clearTimeout(blurTimer.current);
                    }}
                    onClick={() => selectSuggestion(s)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex w-full items-center gap-2.5 border-b-2 border-ink/10 px-4 py-2.5 text-left font-body text-sm font-bold text-ink last:border-b-0 ${
                      i === active ? "bg-brand" : "bg-paper"
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 shrink-0 text-charcoal/60" />
                    <span className="truncate">{s}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !company.trim()}
          className="neo-press-lg inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-ink bg-ink px-6 py-3.5 font-body font-bold text-paper disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Researching
            </>
          ) : (
            <>
              Research it <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      {loading && (
        <div className="mt-6 border-2 border-ink bg-paper p-5 shadow-hard">
          <div className="space-y-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink ${
                    i < step ? "bg-brand" : i === step ? "bg-sage" : "bg-paper"
                  }`}
                >
                  {i < step ? (
                    <Check className="h-3.5 w-3.5 text-ink" />
                  ) : i === step ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-ink" />
                  ) : null}
                </span>
                <span
                  className={`font-body text-sm font-bold ${
                    i <= step ? "text-ink" : "text-charcoal/40"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 border-2 border-ink bg-[color:var(--color-star)] p-4 shadow-hard">
          <p className="font-body font-bold text-ink">{error}</p>
        </div>
      )}
    </div>
  );
}
