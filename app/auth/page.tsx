"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { startTransition, useEffect, useMemo, useState } from "react";
import {
  createEmptyAccountState,
  type AccountState,
  type AuthProvider,
} from "@/lib/miror-data";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const ACCOUNT_STORAGE_KEY = "miror-account";

type AuthMode = "login" | "signup";

const providerButtons: Array<{
  label: string;
  provider: AuthProvider;
  description: string;
}> = [
  {
    label: "Continue with Google",
    provider: "google",
    description: "Prepared for future Supabase social auth.",
  },
  {
    label: "Continue with Facebook",
    provider: "facebook",
    description: "Prepared for future Supabase social auth.",
  },
  {
    label: "Continue with Phone",
    provider: "phone",
    description: "Prepared for future OTP and phone verification flows.",
  },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getMode(value: string | null): AuthMode {
  return value === "login" ? "login" : "signup";
}

function buildAccountState(config: {
  provider: AuthProvider;
  loginIdentifier: string;
  mode: AuthMode;
}): AccountState {
  const fallbackName =
    config.provider === "email"
      ? config.loginIdentifier.split("@")[0] || "MIROR user"
      : config.provider[0].toUpperCase() + config.provider.slice(1) + " user";

  return {
    ...createEmptyAccountState(),
    accessMode: "member",
    authProvider: config.provider,
    displayName: fallbackName,
    loginIdentifier: config.loginIdentifier,
    onboardingComplete: config.mode === "login",
  };
}

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedMode = useMemo(
    () => getMode(searchParams.get("mode")),
    [searchParams],
  );
  const [mode, setMode] = useState<AuthMode>(requestedMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setMode(requestedMode);
  }, [requestedMode]);

  function goToMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    startTransition(() => {
      router.replace(`/auth?mode=${nextMode}`);
    });
  }

  function enterWorkspace(provider: AuthProvider, loginIdentifier: string) {
    const nextAccount = buildAccountState({
      provider,
      loginIdentifier,
      mode,
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        ACCOUNT_STORAGE_KEY,
        JSON.stringify(nextAccount),
      );
    }

    startTransition(() => {
      router.push(
        `/workspace?access=member&provider=${provider}&section=${
          mode === "signup" ? "profile" : "analyze"
        }`,
      );
    });
  }

  function onEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Use a password with at least 6 characters.");
      return;
    }

    setPending(true);
    setError("");
    enterWorkspace("email", trimmedEmail);
  }

  function onProviderClick(provider: AuthProvider) {
    setPending(true);
    setError("");
    enterWorkspace(provider, `${provider}@miror.local`);
  }

  const title =
    mode === "login" ? "Log back into MIROR." : "Create your MIROR account.";
  const description =
    mode === "login"
      ? "Use email and password for now, or pick a prepared provider lane while Supabase Auth is wired in."
      : "Set up the app entry now, then connect it to Supabase Auth later without redesigning the flow.";
  const primaryAction = mode === "login" ? "Login" : "Create Account";
  const modeQuestion =
    mode === "login"
      ? "New here?"
      : "Already have an account?";
  const modeSwitchLabel =
    mode === "login" ? "Create Account" : "Login";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fcfaf5] text-[#17130e]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 12%, rgba(124,78,12,0.08), transparent 28%), radial-gradient(circle at 82% 22%, rgba(124,78,12,0.05), transparent 24%), linear-gradient(180deg, rgba(252,250,245,0.98), rgba(252,250,245,1))",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm text-[#6f6658] transition-colors hover:text-[#17130e]"
          >
            Back to home
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => goToMode("login")}
              className={cx(
                "rounded-sm border px-4 py-2 text-sm transition-colors",
                mode === "login"
                  ? "border-amber-800 bg-amber-800 text-white"
                  : "border-[#d7ccb7] text-[#6f6658] hover:border-amber-700/40 hover:text-amber-900",
              )}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => goToMode("signup")}
              className={cx(
                "rounded-sm border px-4 py-2 text-sm transition-colors",
                mode === "signup"
                  ? "border-amber-800 bg-amber-800 text-white"
                  : "border-[#d7ccb7] text-[#6f6658] hover:border-amber-700/40 hover:text-amber-900",
              )}
            >
              Create Account
            </button>
            <Link
              href="/workspace?access=guest&section=analyze"
              className="rounded-sm border border-amber-800 px-4 py-2 text-sm text-amber-800 transition-colors hover:bg-amber-800 hover:text-white"
            >
              Try as Guest
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.94fr_1.06fr]">
          <section className="space-y-6">
            <div className="inline-flex border border-amber-800 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-amber-800">
              MIROR access flow
            </div>
            <h1
              className={cx(
                playfair.className,
                "max-w-3xl text-5xl leading-[0.94] md:text-6xl",
              )}
            >
              Keep the landing page public, and route real users into the app.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[#6f6658]">
              This auth layer is intentionally lightweight for now. It gives MIROR a real Login,
              Create Account, and Guest path today while staying clean for later Supabase Auth
              integration.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-[#ddd3c1] bg-[#fffdf8] p-6">
                <div className="text-[11px] uppercase tracking-[0.18em] text-amber-800">
                  After entry
                </div>
                <h2 className={cx(playfair.className, "mt-3 text-3xl")}>
                  The app shell opens with separate lanes.
                </h2>
                <ul className="mt-4 space-y-2 text-sm leading-7 text-[#6f6658]">
                  <li>Profile stores user info and personal features.</li>
                  <li>Analyze keeps look and buy-item checks separate.</li>
                  <li>Wardrobe stores clothing-only uploads.</li>
                  <li>Try It On stays ready for person-plus-garment flows.</li>
                </ul>
              </div>

              <div className="border border-[#ddd3c1] bg-[#fffdf8] p-6">
                <div className="text-[11px] uppercase tracking-[0.18em] text-amber-800">
                  Guest mode
                </div>
                <h2 className={cx(playfair.className, "mt-3 text-3xl")}>
                  Skip setup and test MIROR right away.
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#6f6658]">
                  Guests can still upload a look or item and test the analysis flow without being
                  forced through account creation first.
                </p>
              </div>
            </div>
          </section>

          <section className="border border-[#ddd3c1] bg-[#fffdf8] p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-amber-800">
                  {mode === "login" ? "Login tab" : "Create account tab"}
                </div>
                <h2 className={cx(playfair.className, "mt-3 text-4xl")}>{title}</h2>
              </div>

              <div className="flex rounded-sm border border-[#ddd3c1] bg-[#fcfaf5] p-1">
                <button
                  type="button"
                  onClick={() => goToMode("login")}
                  className={cx(
                    "rounded-sm px-4 py-2 text-sm transition-colors",
                    mode === "login"
                      ? "bg-amber-800 text-white"
                      : "text-[#6f6658] hover:text-[#17130e]",
                  )}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => goToMode("signup")}
                  className={cx(
                    "rounded-sm px-4 py-2 text-sm transition-colors",
                    mode === "signup"
                      ? "bg-amber-800 text-white"
                      : "text-[#6f6658] hover:text-[#17130e]",
                  )}
                >
                  Create Account
                </button>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-[#6f6658]">{description}</p>

            <form onSubmit={onEmailSubmit} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-[#6f6658]">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[#d7ccb7] bg-[#fffdf8] px-4 py-3 text-sm text-[#17130e] outline-none transition-colors placeholder:text-[#8f8372] focus:border-amber-700"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-[#6f6658]">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-[#d7ccb7] bg-[#fffdf8] px-4 py-3 text-sm text-[#17130e] outline-none transition-colors placeholder:text-[#8f8372] focus:border-amber-700"
                />
              </label>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-sm border border-amber-800 bg-amber-800 px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:border-amber-900 hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "Entering MIROR..." : primaryAction}
              </button>
            </form>

            <div className="mt-8">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#e3d9c7]" />
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#8f8372]">
                  Future provider entry
                </span>
                <div className="h-px flex-1 bg-[#e3d9c7]" />
              </div>

              <div className="mt-4 space-y-3">
                {providerButtons.map((provider) => (
                  <button
                    key={provider.provider}
                    type="button"
                    onClick={() => onProviderClick(provider.provider)}
                    disabled={pending}
                    className="w-full rounded-xl border border-[#ddd3c1] bg-[#fcfaf5] px-4 py-4 text-left transition-colors hover:border-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="text-sm font-semibold text-[#17130e]">
                      {provider.label}
                    </div>
                    <div className="mt-1 text-xs leading-6 text-[#6f6658]">
                      {provider.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-[#e3d9c7] bg-[#fcfaf5] p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-amber-800">
                Not ready to sign up?
              </div>
              <p className="mt-2 text-sm leading-7 text-[#6f6658]">
                Choose guest mode to test uploads and analysis now. You can wire full Supabase Auth
                into this same entry screen later.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/workspace?access=guest&section=analyze"
                  className="rounded-sm border border-amber-800 px-4 py-2 text-sm text-amber-800 transition-colors hover:bg-amber-800 hover:text-white"
                >
                  Try as Guest
                </Link>
                <button
                  type="button"
                  onClick={() => goToMode(mode === "login" ? "signup" : "login")}
                  className="rounded-sm border border-[#d7ccb7] px-4 py-2 text-sm text-[#6f6658] transition-colors hover:border-amber-700/40 hover:text-amber-900"
                >
                  {modeQuestion} {modeSwitchLabel}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
