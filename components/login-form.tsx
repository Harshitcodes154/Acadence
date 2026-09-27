"use client";

import { useState, type FormEvent } from "react";
import {
  CalendarDays,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LayoutGrid,
  Loader2,
} from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebaseClient";
import { useAuth } from "@/app/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const authErrors: Record<string, string> = {
  "auth/invalid-credential":
    "The email or password is incorrect. Please try again.",
  "auth/email-already-in-use":
    "An account with this email already exists. Please sign in.",
  "auth/weak-password": "Use a password with at least 8 characters.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment before trying again.",
  "auth/network-request-failed":
    "Unable to connect. Check your internet connection and try again.",
  "auth/operation-not-allowed":
    "Email sign-in is not enabled. Please contact the project administrator.",
  "auth/invalid-api-key":
    "The authentication configuration is invalid. You can still explore the demo.",
  "auth/user-disabled":
    "This account is disabled. Please contact your administrator.",
};
export function LoginForm() {
  const { startDemo, error: sessionError } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError("");
    if (!auth) {
      setError(
        "Account sign-in is not configured. Open the demo workspace below.",
      );
      return;
    }
    if (registering && password.length < 8) {
      setError("Use a password with at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await (
        registering
          ? createUserWithEmailAndPassword
          : signInWithEmailAndPassword
      )(auth, email.trim(), password);
    } catch (err) {
      const code =
        typeof err === "object" && err && "code" in err ? String(err.code) : "";
      setError(
        authErrors[code] ||
          "We couldn’t sign you in. Check your details and try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="relative flex flex-col overflow-hidden bg-[#17182e] px-7 py-9 text-white sm:px-14 lg:p-16">
        <div
          aria-hidden="true"
          className="absolute -right-40 top-40 h-[520px] w-[520px] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 top-56 h-[390px] w-[390px] rounded-full border border-white/10"
        />
        <a
          href="/"
          className="relative flex w-fit items-center gap-3 text-xl font-bold tracking-tight"
        >
          <span className="rounded-xl bg-[#8c7bf7] p-2.5">
            <CalendarDays className="h-6 w-6" />
          </span>{" "}
          acadence<span className="text-[#a79ae9]">.</span>
        </a>
        <div className="relative my-auto max-w-lg py-14 lg:py-20">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-violet-200">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-300" /> A little
            structure. A lot more possibility.
          </span>
          <h1 className="text-4xl font-semibold leading-[1.13] tracking-tight sm:text-5xl xl:text-6xl">
            Great semesters
            <br />
            start with a<br />
            <span className="text-[#b4a5ff]">better schedule.</span>
          </h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-slate-300">
            Bring your subjects, classrooms, and batches together. Make room for
            what matters: learning.
          </p>
          <div className="mt-9 space-y-3 text-sm text-slate-200">
            {[
              "One organized planning workspace",
              "Balanced weekly subject allocation",
              "Review, refine, and export in a few clicks",
            ].map((text) => (
              <p key={text} className="flex items-center gap-3">
                <Check className="h-4 w-4 text-violet-300" />
                {text}
              </p>
            ))}
          </div>
          <div className="mt-10 hidden rounded-2xl border border-white/10 bg-white/5 p-5 sm:block">
            <div className="mb-4 flex justify-between text-xs">
              <span className="flex items-center gap-2 text-violet-200">
                <LayoutGrid className="h-4 w-4" /> A week, in harmony
              </span>
              <span className="text-slate-400">MON — FRI</span>
            </div>
            <div aria-hidden="true" className="grid grid-cols-5 gap-2">
              {Array.from({ length: 15 }, (_, i) => (
                <div
                  key={i}
                  className={`h-8 rounded-md ${["bg-violet-400/35", "bg-blue-400/25", "bg-white/10", "bg-emerald-300/25", "bg-orange-300/25"][i % 5]}`}
                />
              ))}
            </div>
          </div>
        </div>
        <p className="relative text-xs text-slate-400">
          Thoughtfully built for academic planning.
        </p>
      </section>
      <section className="flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <p className="eyebrow mb-3">YOUR NEXT SEMESTER STARTS HERE</p>
          <h2 className="text-3xl font-semibold tracking-tight">
            {registering ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mb-8 mt-3 text-sm leading-6 text-muted-foreground">
            {registering
              ? "A calmer way to plan your academic week."
              : "Sign in and give your academic week a little clarity."}
          </p>
          {!isFirebaseConfigured && (
            <p className="notice mb-6 border-violet-100 bg-violet-50 text-violet-800">
              Explore the full planning flow in demo mode. Account sign-in
              becomes available once Firebase is configured.
            </p>
          )}
          <form onSubmit={submit} className="space-y-5">
            <fieldset
              disabled={loading || !isFirebaseConfigured}
              className="space-y-5 disabled:opacity-60"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Academic email</Label>
                <input
                  className="field"
                  id="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <input
                    className="field pr-12"
                    id="password"
                    type={visible ? "text" : "password"}
                    autoComplete={
                      registering ? "new-password" : "current-password"
                    }
                    minLength={registering ? 8 : 1}
                    maxLength={128}
                    required
                    placeholder={
                      registering
                        ? "At least 8 characters"
                        : "Enter your password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    aria-label={visible ? "Hide password" : "Show password"}
                    aria-pressed={visible}
                    onClick={() => setVisible(!visible)}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground"
                  >
                    {visible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button className="h-11 w-full" type="submit">
                {loading ? <Loader2 className="animate-spin" /> : null}
                {loading
                  ? "Please wait…"
                  : registering
                    ? "Create account"
                    : "Sign in"}
                {!loading && <ArrowRight />}
              </Button>
            </fieldset>
            {(error || sessionError) && (
              <p
                role="alert"
                className="notice border-red-200 bg-red-50 text-destructive"
              >
                {error || sessionError}
              </p>
            )}
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            {registering ? "Already have an account?" : "New to acadence?"}{" "}
            <button
              disabled={loading}
              className="font-semibold text-primary hover:underline"
              onClick={() => {
                setRegistering(!registering);
                setError("");
                setPassword("");
              }}
            >
              {registering ? "Sign in" : "Create an account"}
            </button>
          </p>
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              OR TAKE A LOOK AROUND
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Button
            variant="outline"
            disabled={loading}
            className="h-11 w-full"
            onClick={startDemo}
          >
            Explore demo workspace <ArrowRight />
          </Button>
          <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
            No account needed. Schedules stay in this browser.
            <br />
            Demo data is shared by anyone using this browser.
          </p>
        </div>
      </section>
    </main>
  );
}
