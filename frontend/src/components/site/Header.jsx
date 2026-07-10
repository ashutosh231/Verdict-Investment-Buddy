import { Link, useNavigate } from "react-router-dom";
import { LogOut, Zap } from "lucide-react";

import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-brand border-b-2 border-ink">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-ink">
            <Zap className="h-5 w-5 fill-brand text-brand" />
          </span>
          <span className="font-display text-2xl font-extrabold tracking-tighter text-ink">
            Verdict
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {[
            ["How it works", "/#how"],
            ["Features", "/#features"],
            ["Who it's for", "/#personas"],
            ["Reviews", "/#reviews"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="font-body font-bold text-ink transition-colors hover:text-charcoal/70"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden font-body font-bold text-ink hover:text-charcoal/70 sm:block"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="neo-press inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-paper px-4 py-2.5 font-body font-bold text-ink"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden font-body font-bold text-ink hover:text-charcoal/70 sm:block"
              >
                Sign in
              </Link>
              <Link
                to="/dashboard"
                className="neo-press inline-flex items-center justify-center rounded-xl border-2 border-ink bg-ink px-5 py-2.5 font-body font-bold text-paper"
              >
                Run a Verdict
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
