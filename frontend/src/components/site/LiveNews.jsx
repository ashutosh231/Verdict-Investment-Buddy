import { useEffect, useState } from "react";
import { ExternalLink, Newspaper } from "lucide-react";

import { api } from "@/lib/api";

function timeAgo(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function LiveNews() {
  const [news, setNews] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get("/api/public/market/news")
      .then((res) => {
        if (!active) return;
        setNews(res.data.news ?? []);
        setLoaded(true);
      })
      .catch(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="border-2 border-ink bg-paper shadow-hard">
      <div className="flex items-center gap-2 border-b-2 border-ink bg-brand px-4 py-3">
        <Newspaper className="h-5 w-5 text-ink" />
        <h2 className="font-display text-lg font-extrabold tracking-tight text-ink">
          Live market news
        </h2>
        <span className="ml-auto flex items-center gap-1.5 font-body text-xs font-bold uppercase tracking-widest text-ink">
          <span className="h-2 w-2 animate-pulse rounded-full bg-ink" /> Live
        </span>
      </div>

      <div className="max-h-[560px] divide-y-2 divide-ink overflow-y-auto">
        {!loaded ? (
          <p className="p-6 text-center font-body text-sm text-charcoal/60">
            Loading latest headlines…
          </p>
        ) : news.length === 0 ? (
          <p className="p-6 text-center font-body text-sm text-charcoal/60">
            No headlines available right now.
          </p>
        ) : (
          news.map((n, i) => (
            <a
              key={i}
              href={n.url || "#"}
              target="_blank"
              rel="noreferrer"
              className="group flex gap-3 p-4 transition-colors hover:bg-sage/30"
            >
              {n.image ? (
                <img
                  src={n.image}
                  alt=""
                  loading="lazy"
                  className="h-16 w-16 shrink-0 border-2 border-ink object-cover"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-display text-sm font-extrabold leading-snug tracking-tight text-ink">
                  {n.title}
                </p>
                <p className="mt-1 line-clamp-2 font-body text-xs text-charcoal/70">{n.summary}</p>
                <div className="mt-1.5 flex items-center gap-2 font-body text-[11px] font-bold uppercase tracking-wider text-charcoal/50">
                  <span>{n.source}</span>
                  {n.date ? <span>· {timeAgo(n.date)}</span> : null}
                  <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  );
}
