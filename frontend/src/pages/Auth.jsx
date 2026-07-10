import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Zap } from "lucide-react";

import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  const { user, loading, login, signup } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Sign in — Verdict";
  }, []);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [loading, user, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "signup") {
        await signup(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dot-grid flex min-h-screen items-center justify-center bg-brand px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center border-2 border-ink bg-ink">
            <Zap className="h-6 w-6 fill-brand text-brand" />
          </span>
          <span className="font-display text-3xl font-extrabold tracking-tighter text-ink">
            Verdict
          </span>
        </Link>

        <div className="border-2 border-ink bg-paper p-7 shadow-hard-lg">
          {/* Tabs */}
          <div className="mb-6 grid grid-cols-2 gap-2 border-2 border-ink p-1">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={`rounded-md py-2 font-body font-bold transition-colors ${
                  mode === m ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-sage"
                }`}
              >
                {m === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <h1 className="mb-1 font-display text-3xl font-extrabold tracking-tighter text-ink">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mb-6 font-body text-sm text-charcoal/70">
            {mode === "login"
              ? "Sign in to reach your research dashboard."
              : "Start running AI investment verdicts in seconds."}
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1 block font-body text-sm font-bold text-ink">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border-2 border-ink bg-paper px-3 py-2.5 font-body font-medium text-ink outline-none focus:shadow-hard"
                  placeholder="Ada Lovelace"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block font-body text-sm font-bold text-ink">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border-2 border-ink bg-paper px-3 py-2.5 font-body font-medium text-ink outline-none focus:shadow-hard"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block font-body text-sm font-bold text-ink">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border-2 border-ink bg-paper px-3 py-2.5 font-body font-medium text-ink outline-none focus:shadow-hard"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <div className="border-2 border-ink bg-star p-3">
                <p className="font-body text-sm font-bold text-ink">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="neo-press-lg inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-ink px-6 py-3.5 font-body font-bold text-paper disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Please wait
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center font-body text-sm text-charcoal/70">
          {mode === "login" ? "New to Verdict? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-bold text-ink underline"
          >
            {mode === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
