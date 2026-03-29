"use client";

import { PricingGrid } from "@/components/pricing-grid";
import { Playfair_Display } from "next/font/google";
import { type ChangeEvent, useState } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

type Theme = "dark" | "light";
type PageState = "home" | "pricing";
type Mode = "look" | "buy";
type Occasion = "date" | "party" | "work" | "wedding" | "casual";

type AnalysisResult = {
  verdict: string;
  tone: string;
  confidence: number;
  outfit: number;
  grooming: number;
  color: number;
  occasion: number;
  tips: string[];
  positives: string[];
  negatives: string[];
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const occasionLabels: Record<Occasion, string> = {
  date: "Date",
  party: "Party",
  work: "Work",
  wedding: "Wedding",
  casual: "Casual",
};

const statCards = [
  ["4.2K", "Looks analyzed"],
  ["94%", "Said it helped"],
  ["<30S", "Average analysis time"],
  ["6", "Occasion types"],
] as const;

const processSteps = [
  {
    step: "01 /",
    token: "Upload",
    title: "Upload your photo",
    description:
      "Take a clear selfie or use a recent full-look shot. Better input gives better coaching.",
  },
  {
    step: "02 /",
    token: "Context",
    title: "Choose your occasion",
    description:
      "Date, party, work, wedding, or casual. The same outfit can succeed or fail depending on context.",
  },
  {
    step: "03 /",
    token: "Analysis",
    title: "AI reads the full picture",
    description:
      "Outfit harmony, grooming, color balance, and occasion fit are scored together rather than in isolation.",
  },
  {
    step: "04 /",
    token: "Action",
    title: "Get useful next steps",
    description:
      "What to keep, what to swap, what to buy, and what to stop pretending works.",
  },
] as const;

const featureCards = [
  {
    title: "Skin Tone and Color Matching",
    description:
      "Identifies your approximate tone category and points toward colors that flatter instead of draining you.",
  },
  {
    title: "Face Shape and Haircut Advice",
    description:
      "Suggests better framing, haircut direction, and beard balance so the face and outfit stop fighting each other.",
  },
  {
    title: "Outfit Scoring and Comparison",
    description:
      "Upload up to 3 looks. MIROR ranks them and explains why one wins for the moment you are dressing for.",
  },
  {
    title: "Occasion-Based Context",
    description:
      "A look that works casually can fail on a date. Recommendations adapt to the setting instead of staying generic.",
  },
  {
    title: "Presence and Confidence Cues",
    description:
      "Presentation matters. Posture, polish, and overall sharpness are treated as part of the final impression.",
  },
  {
    title: "Wardrobe Memory",
    description:
      "Paid users can save pieces over time and build combinations without restarting the decision process from zero.",
  },
] as const;

function mockAnalyze(
  mode: Mode,
  occasion: Occasion,
  groupMode: boolean,
  outfitCount: number,
): AnalysisResult {
  const base = {
    date: { confidence: 78, outfit: 73, grooming: 82, color: 70, occasion: 76 },
    party: { confidence: 83, outfit: 75, grooming: 79, color: 74, occasion: 80 },
    work: { confidence: 74, outfit: 77, grooming: 80, color: 72, occasion: 84 },
    wedding: { confidence: 81, outfit: 79, grooming: 84, color: 76, occasion: 82 },
    casual: { confidence: 76, outfit: 71, grooming: 75, color: 73, occasion: 78 },
  }[occasion];

  if (mode === "buy") {
    return {
      verdict: "Worth buying, but only if it earns a real place in your wardrobe.",
      tone: "The item has visual value, but it still needs to justify the purchase.",
      confidence: 80,
      outfit: 82,
      grooming: 0,
      color: 76,
      occasion: 74,
      positives: [
        "The item has enough structure to look intentional instead of forgettable.",
        "The color looks wearable and easy to combine with neutrals.",
        "It can move across more than one setting, which makes it easier to justify.",
      ],
      negatives: [
        "It is not unique enough to justify the spend if you already own something close.",
        "Fit and fabric quality will decide whether this becomes a smart buy or dead weight.",
      ],
      tips: [
        "Buy it if it fills a wardrobe gap, not because the product photo seduced you.",
        "If you cannot style it with at least 3 outfits, skip it.",
        "Check fabric, shoulder line, and length before spending.",
      ],
    };
  }

  return {
    verdict:
      outfitCount > 1
        ? "Best outfit selected. Strong enough to wear, still room to sharpen it."
        : "Good base. One or two changes would upgrade the whole look.",
    tone: groupMode
      ? "Group-photo mode should eventually force the user to identify themselves before scoring."
      : "The result should feel honest and useful, not flattering for no reason.",
    confidence: base.confidence,
    outfit: base.outfit + Math.min(outfitCount, 2),
    grooming: base.grooming,
    color: base.color,
    occasion: base.occasion,
    positives: [
      "Grooming reads clean enough to support the overall look.",
      "The silhouette is coherent and not chaotic.",
      "The outfit can work for the selected occasion without embarrassing you.",
    ],
    negatives: [
      "The outfit is decent but still a little safe and underpowered.",
      "Color harmony is acceptable, not sharp. It needs one cleaner choice.",
    ],
    tips: [
      "Use one stronger anchor piece instead of letting the whole outfit stay politely average.",
      "Keep colors tighter near the face. Cleaner contrast usually wins.",
      "The backend prompt should judge harder and ban empty praise.",
    ],
  };
}

function BackgroundDecor({ isDark }: { isDark: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(circle at 18% 12%, rgba(201,168,76,0.1), transparent 28%), radial-gradient(circle at 82% 22%, rgba(201,168,76,0.08), transparent 24%), linear-gradient(180deg, rgba(5,5,5,0.96), rgba(5,5,5,1))"
            : "radial-gradient(circle at 18% 12%, rgba(124,78,12,0.08), transparent 28%), radial-gradient(circle at 82% 22%, rgba(124,78,12,0.05), transparent 24%), linear-gradient(180deg, rgba(252,250,245,0.98), rgba(252,250,245,1))",
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: isDark
            ? "linear-gradient(rgba(201,168,76,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.05) 1px, transparent 1px)"
            : "linear-gradient(rgba(124,78,12,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,78,12,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(circle at center, rgba(0,0,0,0.8) 32%, rgba(0,0,0,0) 78%)",
        }}
      />
    </div>
  );
}

function Score({
  isDark,
  label,
  value,
}: {
  isDark: boolean;
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className={isDark ? "text-[#9f9687]" : "text-[#6f6658]"}>{label}</span>
        <span className={isDark ? "text-[#c9a84c]" : "text-amber-800"}>{value}</span>
      </div>
      <div className={cx("h-1.5 rounded-full", isDark ? "bg-white/10" : "bg-[#dfd5c3]")}> 
        <div className="h-1.5 rounded-full bg-[#c9a84c]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function Page() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [page, setPage] = useState<PageState>("home");
  const [mode, setMode] = useState<Mode>("look");
  const [occasion, setOccasion] = useState<Occasion>("date");
  const [groupMode, setGroupMode] = useState(false);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [outfits, setOutfits] = useState<Array<string | null>>([null, null, null]);
  const [itemToBuy, setItemToBuy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const isDark = theme === "dark";
  const uploadedOutfitCount = outfits.filter(Boolean).length;
  const canAnalyze = mode === "look" ? Boolean(selfie) : Boolean(itemToBuy);
  const previewImage = mode === "look" ? selfie : itemToBuy;

  const pageStyle = {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  };

  const wrapClass = cx(
    "relative min-h-screen overflow-x-hidden transition-colors duration-300",
    isDark ? "bg-[#050505] text-[#efe7da]" : "bg-[#fcfaf5] text-[#17130e]",
  );
  const panelClass = cx(
    "border transition-colors duration-300",
    isDark ? "border-[#27211a] bg-[#0a0a0a]" : "border-[#ddd3c1] bg-[#fffdf8]",
  );
  const softPanelClass = cx(
    "rounded-2xl border transition-colors duration-300",
    isDark ? "border-[#2b261f] bg-[#0f0f0f]" : "border-[#e3d9c7] bg-[#f7f1e8]",
  );
  const accentTextClass = isDark ? "text-[#c9a84c]" : "text-amber-800";
  const accentBorderClass = isDark ? "border-[#c9a84c]" : "border-amber-800";
  const accentButtonClass = cx(
    "transition-colors",
    isDark
      ? "border border-[#c9a84c] bg-[#c9a84c] text-black hover:border-[#d8b865] hover:bg-[#d8b865]"
      : "border border-amber-800 bg-amber-800 text-white hover:border-amber-900 hover:bg-amber-900",
  );
  const mutedClass = isDark ? "text-[#8d8476]" : "text-[#6f6658]";
  const subduedClass = isDark ? "text-[#6a6358]" : "text-[#8f8372]";
  const secondaryButtonClass = isDark
    ? "border-[#2b261f] text-[#8d8476] hover:border-[#4a3922] hover:text-[#efe7da]"
    : "border-[#d7ccb7] text-[#6f6658] hover:border-amber-700/40 hover:text-amber-900";
  const sectionDividerClass = isDark ? "bg-[#1d1a16]" : "bg-[#ddd3c1]";
  const sectionSurfaceClass = isDark ? "bg-[#090909]" : "bg-[#f7f1e8]";
  const logoClass = cx(playfair.className, "select-none text-[2rem] font-medium uppercase tracking-[0.32em]");
  const headingClass = playfair.className;
  const sectionEyebrowClass = cx("text-[11px] uppercase tracking-[0.24em]", accentTextClass);
  const inactivePillClass = cx("border", secondaryButtonClass);
  const inputShellClass = cx(softPanelClass, "border-dashed");

  const pillClass = (active: boolean) =>
    cx(
      "rounded-full px-4 py-2 text-sm",
      active ? `${accentButtonClass} font-semibold` : inactivePillClass,
    );

  const squareButtonClass = (active: boolean) =>
    cx(
      "rounded-sm border px-4 py-3 text-sm transition-colors",
      active ? `${accentButtonClass} font-semibold` : secondaryButtonClass,
    );

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  async function onSingleImage(
    event: ChangeEvent<HTMLInputElement>,
    setter: (value: string | null) => void,
  ) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setter(dataUrl);
    setResult(null);
  }

  async function onOutfitImage(event: ChangeEvent<HTMLInputElement>, index: number) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setOutfits((currentOutfits) =>
      currentOutfits.map((item, itemIndex) => (itemIndex === index ? dataUrl : item)),
    );
    setResult(null);
  }

  async function runMockAnalysis() {
    if (!canAnalyze) {
      return;
    }

    setLoading(true);
    setResult(null);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1200);
    });
    setResult(mockAnalyze(mode, occasion, groupMode, uploadedOutfitCount));
    setLoading(false);
  }

  if (page === "pricing") {
    return (
      <div className={wrapClass} style={pageStyle}>
        <BackgroundDecor isDark={isDark} />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setPage("home")}
              className={cx("text-sm transition-colors", mutedClass, "hover:text-inherit")}
            >
              Back to home
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className={cx(
                "rounded-sm border px-4 py-2 text-sm transition-colors",
                accentBorderClass,
                accentTextClass,
              )}
            >
              {isDark ? "White mode" : "Black mode"}
            </button>
          </div>

          <div className="mt-16 text-center">
            <div className={cx("inline-flex border px-4 py-2 text-[11px] uppercase tracking-[0.24em]", accentBorderClass, accentTextClass)}>
              Pricing
            </div>
            <h1 className={cx(headingClass, "mt-6 text-5xl md:text-6xl")}>
              Make money without making it feel cheap.
            </h1>
            <p className={cx("mx-auto mt-5 max-w-3xl text-lg leading-8", mutedClass)}>
              Free users unlock a limited analysis by watching an ad. Paid plans remove ads and
              open the serious features.
            </p>
          </div>

          <PricingGrid isDark={isDark} onFreePlanClick={() => setPage("home")} />

          <div className={cx(panelClass, "mt-10 p-8")}>
            <div className={cx("text-[11px] uppercase tracking-[0.22em]", accentTextClass)}>
              Hosted checkout
            </div>
            <h2 className={cx(headingClass, "mt-3 text-3xl")}>
              Coach and Pro now open in Stripe Checkout.
            </h2>
            <p className={cx("mt-3", mutedClass)}>
              The first billing version stays intentionally small: Stripe handles
              the payment page now, and subscription syncing lands in the backend
              phase next.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapClass} style={pageStyle}>
      <BackgroundDecor isDark={isDark} />

      <header
        className={cx(
          "sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300",
          isDark ? "border-[#1d1a16] bg-[#050505]/90" : "border-[#ddd3c1] bg-[#fcfaf5]/90",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div className={logoClass}>
            <span className={isDark ? "text-[#f0ece4]" : "text-[#17130e]"}>MIR</span>
            <span className={accentTextClass}>OR</span>
          </div>

          <nav className="hidden items-center gap-10 md:flex">
            <a href="#process" className={cx("text-[11px] uppercase tracking-[0.16em] transition-colors", mutedClass, "hover:text-inherit")}>
              How it works
            </a>
            <a href="#features" className={cx("text-[11px] uppercase tracking-[0.16em] transition-colors", mutedClass, "hover:text-inherit")}>
              Features
            </a>
            <a href="#demo" className={cx("text-[11px] uppercase tracking-[0.16em] transition-colors", mutedClass, "hover:text-inherit")}>
              Try it
            </a>
            <button
              type="button"
              onClick={() => setPage("pricing")}
              className={cx("text-[11px] uppercase tracking-[0.16em] transition-colors", mutedClass, "hover:text-inherit")}
            >
              Pricing
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className={cx(
                "rounded-sm border px-4 py-2 text-sm transition-colors",
                accentBorderClass,
                accentTextClass,
              )}
            >
              {isDark ? "White mode" : "Black mode"}
            </button>
            <button
              type="button"
              onClick={() => setPage("pricing")}
              className={cx("rounded-sm px-5 py-2.5 text-sm font-semibold", accentButtonClass)}
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative overflow-hidden px-6 pb-24 pt-24 md:pb-32 md:pt-32">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="relative">
              <div className={cx("inline-flex border px-4 py-2 text-[11px] uppercase tracking-[0.24em]", accentBorderClass, accentTextClass)}>
                Private AI appearance coach
              </div>
              <h1 className={cx(headingClass, "mt-8 max-w-5xl text-6xl leading-[0.92] md:text-[6.2rem]")}>
                Look your <span className={cx(accentTextClass, "italic")}>absolute best.</span>
              </h1>
              <p className={cx("mt-8 max-w-xl text-lg leading-8", mutedClass)}>
                Upload a selfie, choose the occasion, and get sharp guidance on outfit harmony,
                grooming, colors, and whether the whole thing actually works before you leave.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#demo"
                  className={cx(
                    "rounded-sm px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em]",
                    accentButtonClass,
                  )}
                >
                  Analyze my look
                </a>
                <a
                  href="#process"
                  className={cx(
                    "rounded-sm border px-6 py-4 text-sm uppercase tracking-[0.12em] transition-colors",
                    secondaryButtonClass,
                  )}
                >
                  See how it works
                </a>
              </div>
            </div>

            <div className="relative ml-auto w-full max-w-[420px]">
              <div className={cx(panelClass, "rounded-[2rem] p-4 shadow-2xl shadow-black/25")}>
                <div
                  className={cx(
                    "rounded-[1.5rem] p-5",
                    isDark ? "bg-[#0a0a0a]" : "bg-[#fffdf8]",
                  )}
                >
                  <div
                    className={cx(
                      "flex items-center justify-between border-b pb-4",
                      isDark ? "border-white/10" : "border-[#e3d9c7]",
                    )}
                  >
                    <div className={cx(playfair.className, "text-sm uppercase tracking-[0.22em]")}>
                      <span className={isDark ? "text-[#f0ece4]" : "text-[#17130e]"}>MIR</span>
                      <span className={accentTextClass}>OR</span>
                    </div>
                    <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                      Date mode
                    </div>
                  </div>

                  <div
                    className={cx(
                      "mt-4 rounded-2xl border border-dashed p-8 text-center",
                      isDark ? "border-white/10 bg-white/5" : "border-[#d9ceb9] bg-[#f8f3ea]",
                    )}
                  >
                    <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                      Upload preview
                    </div>
                    <div className={cx("mt-3 text-base font-semibold", isDark ? "text-[#f0ece4]" : "text-[#17130e]")}>
                      Selfie or full look
                    </div>
                    <div className={cx("mt-2 text-sm", mutedClass)}>
                      Keep it clear. MIROR does the judging after the upload.
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {["Date", "Party", "Work", "Casual"].map((option, index) => (
                      <span
                        key={option}
                        className={cx(
                          "rounded-full px-3 py-1.5 text-xs",
                          index === 0
                            ? accentButtonClass
                            : isDark
                              ? "bg-white/5 text-[#8d8476]"
                              : "bg-[#eee5d8] text-[#6f6658]",
                        )}
                      >
                        {option}
                      </span>
                    ))}
                  </div>

                  <div
                    className={cx(
                      "mt-4 rounded-2xl p-4",
                      isDark ? "bg-white/5" : "border border-[#e3d9c7] bg-[#f8f3ea]",
                    )}
                  >
                    <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                      Appearance score
                    </div>
                    <div className="mt-4 space-y-3">
                      <Score isDark={isDark} label="Outfit harmony" value={82} />
                      <Score isDark={isDark} label="Color match" value={76} />
                      <Score isDark={isDark} label="Grooming" value={90} />
                      <Score isDark={isDark} label="Occasion fit" value={68} />
                    </div>
                    <div
                      className={cx(
                        "mt-4 inline-flex rounded-sm border px-3 py-2 text-[10px] uppercase tracking-[0.15em]",
                        isDark
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-emerald-300 bg-emerald-50 text-emerald-700",
                      )}
                    >
                      Mostly ready
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={cx(
                  panelClass,
                  "absolute -left-10 bottom-8 hidden w-48 rounded-[1.5rem] p-5 lg:block",
                )}
              >
                <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                  Quick note
                </div>
                <div className={cx(headingClass, "mt-3 text-2xl leading-tight")}>
                  Sharper collar. Better balance.
                </div>
              </div>

              <div
                className={cx(
                  panelClass,
                  "absolute -right-10 top-10 hidden w-56 rounded-[1.5rem] p-5 xl:block",
                )}
              >
                <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                  MIROR reads
                </div>
                <div className={cx("mt-3 space-y-2 text-sm", mutedClass)}>
                  <div>Suitability for the setting</div>
                  <div>Color discipline near the face</div>
                  <div>Whether the look feels intentional</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={cx(
            "border-y transition-colors duration-300",
            isDark ? "border-[#1d1a16] bg-[#090909]" : "border-[#ddd3c1] bg-[#f7f1e8]",
          )}
        >
          <div className="mx-auto grid max-w-7xl md:grid-cols-4">
            {statCards.map(([value, label]) => (
              <div
                key={label}
                className={cx(
                  "border-r px-8 py-8 last:border-r-0",
                  isDark ? "border-[#1d1a16]" : "border-[#ddd3c1]",
                )}
              >
                <div className={cx(headingClass, "text-5xl leading-none")}>{value}</div>
                <div className={cx("mt-2 text-[11px] uppercase tracking-[0.14em]", subduedClass)}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="process" className="px-6 py-24">
          <div className="mx-auto max-w-7xl">
            <div className={sectionEyebrowClass}>The process</div>
            <h2 className={cx(headingClass, "mt-6 max-w-4xl text-5xl leading-[1.02] md:text-7xl")}>
              Four steps to <span className={cx(accentTextClass, "italic")}>knowing you look good.</span>
            </h2>
            <p className={cx("mt-5 max-w-xl text-lg leading-8", mutedClass)}>
              No opinions from friends. No guessing in the mirror. Just fast, private, honest
              feedback.
            </p>

            <div className={cx("mt-16 grid gap-px md:grid-cols-4", sectionDividerClass)}>
              {processSteps.map((step) => (
                <div
                  key={step.title}
                  className={cx(
                    "p-8 transition-colors duration-300",
                    isDark ? "bg-[#050505]" : "bg-[#fffdf8]",
                  )}
                >
                  <div className={cx("text-[10px] uppercase tracking-[0.18em]", subduedClass)}>
                    {step.step}
                  </div>
                  <div className={cx("mt-8 text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                    {step.token}
                  </div>
                  <h3 className={cx(headingClass, "mt-4 text-[2rem] leading-tight")}>{step.title}</h3>
                  <p className={cx("mt-4 text-sm leading-8", mutedClass)}>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className={cx("px-6 py-24 transition-colors duration-300", sectionSurfaceClass)}>
          <div className="mx-auto max-w-7xl">
            <div className={sectionEyebrowClass}>What we analyze</div>
            <h2 className={cx(headingClass, "mt-6 max-w-4xl text-5xl leading-[1.02] md:text-7xl")}>
              Your complete <span className={cx(accentTextClass, "italic")}>appearance picture.</span>
            </h2>
            <p className={cx("mt-5 max-w-xl text-lg leading-8", mutedClass)}>
              More than a photo filter. A coaching system built around the decisions people actually
              struggle with.
            </p>

            <div className={cx("mt-16 grid gap-px md:grid-cols-3", sectionDividerClass)}>
              {featureCards.map((card, index) => (
                <div
                  key={card.title}
                  className={cx(
                    "min-h-[260px] p-10 transition-colors duration-300",
                    isDark ? "bg-[#090909]" : "bg-[#fffdf8]",
                  )}
                >
                  <div
                    className={cx(
                      "inline-flex h-12 w-12 items-center justify-center rounded-xl border text-sm",
                      isDark ? "border-[#3a2f1c] bg-[#17130f]" : "border-amber-200 bg-amber-50",
                      accentTextClass,
                    )}
                  >
                    0{index + 1}
                  </div>
                  <h3 className={cx(headingClass, "mt-8 text-[2rem] leading-tight")}>{card.title}</h3>
                  <p className={cx("mt-4 text-sm leading-8", mutedClass)}>{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="px-6 py-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className={cx(panelClass, "overflow-hidden rounded-[1.5rem] lg:sticky lg:top-24 lg:h-fit")}>
              <div
                className={cx(
                  "flex items-center justify-between border-b px-5 py-4",
                  isDark ? "border-[#1d1a16] bg-[#0f0f0f]" : "border-[#ddd3c1] bg-[#f7f1e8]",
                )}
              >
                <div className={cx(playfair.className, "text-sm uppercase tracking-[0.22em]")}>
                  <span className={isDark ? "text-[#f0ece4]" : "text-[#17130e]"}>MIR</span>
                  <span className={accentTextClass}>OR</span>
                </div>
                <div className={mutedClass}>Demo</div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("look");
                      setResult(null);
                    }}
                    className={pillClass(mode === "look")}
                  >
                    Current look
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("buy");
                      setResult(null);
                    }}
                    className={pillClass(mode === "buy")}
                  >
                    Should I buy this?
                  </button>
                </div>

                {mode === "look" ? (
                  <div className="mt-6 space-y-6">
                    <label className={cx(inputShellClass, "flex cursor-pointer flex-col items-center justify-center p-6 text-center")}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => onSingleImage(event, setSelfie)}
                      />
                      {selfie ? (
                        <img
                          src={selfie}
                          alt="Uploaded look"
                          className="h-56 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <>
                          <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                            Primary image
                          </div>
                          <div className="mt-3 text-base font-semibold">Upload selfie or full look</div>
                          <div className={cx("mt-2 text-sm", mutedClass)}>
                            Real upload preview here. Backend AI scan comes next.
                          </div>
                        </>
                      )}
                    </label>

                    <div className={cx(softPanelClass, "p-4")}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className={cx("font-semibold", accentTextClass)}>Group photo mode</div>
                          <div className={cx("mt-1 text-sm", mutedClass)}>
                            Later backend work should let the user tap themselves before scoring.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setGroupMode((currentValue) => !currentValue);
                            setResult(null);
                          }}
                          className={cx(
                            "rounded-sm px-4 py-2 text-sm",
                            groupMode
                              ? `${accentButtonClass} font-semibold`
                              : cx("border", accentBorderClass, accentTextClass),
                          )}
                        >
                          {groupMode ? "Enabled" : "Enable"}
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className={cx("mb-3 text-sm", mutedClass)}>Occasion</div>
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {(Object.keys(occasionLabels) as Occasion[]).map((key) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setOccasion(key);
                              setResult(null);
                            }}
                            className={squareButtonClass(occasion === key)}
                          >
                            {occasionLabels[key]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <div className={cx("mb-3 text-sm", mutedClass)}>Outfit options</div>
                        <div className={cx("mb-3 text-xs uppercase tracking-[0.14em]", subduedClass)}>
                          Up to 3 looks
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        {[0, 1, 2].map((index) => (
                          <label
                            key={index}
                            className={cx(inputShellClass, "cursor-pointer p-3")}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => onOutfitImage(event, index)}
                            />
                            {outfits[index] ? (
                              <img
                                src={outfits[index] ?? ""}
                                alt={`Outfit option ${index + 1}`}
                                className="h-32 w-full rounded-xl object-cover"
                              />
                            ) : (
                              <div className={cx("flex h-32 items-center justify-center text-center text-sm", mutedClass)}>
                                Outfit {index + 1}
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    <label className={cx(inputShellClass, "flex cursor-pointer flex-col items-center justify-center p-6 text-center")}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => onSingleImage(event, setItemToBuy)}
                      />
                      {itemToBuy ? (
                        <img
                          src={itemToBuy}
                          alt="Item to buy"
                          className="h-56 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <>
                          <div className={cx("text-[10px] uppercase tracking-[0.18em]", accentTextClass)}>
                            Product image
                          </div>
                          <div className="mt-3 text-base font-semibold">Upload clothing item</div>
                          <div className={cx("mt-2 text-sm", mutedClass)}>
                            Judge whether the piece deserves money or belongs back on the rack.
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                )}

                <button
                  type="button"
                  disabled={!canAnalyze || loading}
                  onClick={runMockAnalysis}
                  className={cx(
                    "mt-6 w-full rounded-sm px-5 py-4 font-semibold uppercase tracking-[0.12em] disabled:cursor-not-allowed disabled:opacity-50",
                    accentButtonClass,
                  )}
                >
                  {loading ? "Analyzing..." : mode === "look" ? "Analyze my look" : "Analyze this item"}
                </button>
              </div>
            </div>

            <div className={cx(panelClass, "rounded-[1.5rem] p-6")}>
              <div className={cx("text-[11px] uppercase tracking-[0.22em]", accentTextClass)}>Results</div>
              <h2 className={cx(headingClass, "mt-3 text-4xl")}>Image shown next to the verdict.</h2>

              <div className="mt-8 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
                <div className={cx("rounded-2xl p-4", isDark ? "bg-[#0f0f0f]" : "border border-[#e3d9c7] bg-[#f7f1e8]")}>
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={mode === "look" ? "Result preview" : "Item preview"}
                      className="h-[420px] w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className={cx("flex h-[420px] items-center justify-center rounded-2xl text-center text-sm", mutedClass)}>
                      {mode === "look" ? "Upload an image first" : "Upload an item first"}
                    </div>
                  )}
                </div>

                <div aria-live="polite">
                  {!result ? (
                    <div className="flex min-h-[420px] flex-col justify-center">
                      <div className={cx("text-[11px] uppercase tracking-[0.22em]", accentTextClass)}>
                        Expected structure
                      </div>
                      <div className={cx(headingClass, "mt-4 text-3xl")}>
                        What the AI should return every single time
                      </div>
                      <ul className={cx("mt-6 space-y-3 text-base", mutedClass)}>
                        <li>- Overall verdict</li>
                        <li>- What works</li>
                        <li>- What hurts</li>
                        <li>- What to change now</li>
                        <li>- Scores that are not ridiculously generous</li>
                        <li>- Best outfit or buy/skip decision</li>
                      </ul>
                    </div>
                  ) : (
                    <div>
                      <div className={cx(softPanelClass, "p-5")}>
                        <div className={cx("text-[11px] uppercase tracking-[0.22em]", accentTextClass)}>
                          Final verdict
                        </div>
                        <h3 className={cx(headingClass, "mt-3 text-4xl leading-tight")}>
                          {result.verdict}
                        </h3>
                        <p className={cx("mt-3", mutedClass)}>{result.tone}</p>
                      </div>

                      <div className="mt-6 space-y-4">
                        <Score isDark={isDark} label="Confidence / Presence" value={result.confidence} />
                        <Score
                          isDark={isDark}
                          label={mode === "buy" ? "Style value" : "Outfit strength"}
                          value={result.outfit}
                        />
                        {mode === "look" ? (
                          <Score isDark={isDark} label="Grooming" value={result.grooming} />
                        ) : null}
                        <Score isDark={isDark} label="Color harmony" value={result.color} />
                        <Score
                          isDark={isDark}
                          label={mode === "buy" ? "Versatility" : "Occasion fit"}
                          value={result.occasion}
                        />
                      </div>

                      <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <div className={cx("rounded-2xl p-4", isDark ? "bg-[#0f0f0f]" : "border border-[#e3d9c7] bg-[#f7f1e8]")}>
                          <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-500">
                            What works
                          </div>
                          <ul className={cx("mt-3 space-y-2 text-sm", mutedClass)}>
                            {result.positives.map((item) => (
                              <li key={item} className="flex gap-3">
                                <span className="text-emerald-500">+</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className={cx("rounded-2xl p-4", isDark ? "bg-[#0f0f0f]" : "border border-[#e3d9c7] bg-[#f7f1e8]")}>
                          <div className="text-[11px] uppercase tracking-[0.18em] text-red-500">
                            What hurts
                          </div>
                          <ul className={cx("mt-3 space-y-2 text-sm", mutedClass)}>
                            {result.negatives.map((item) => (
                              <li key={item} className="flex gap-3">
                                <span className="text-red-500">-</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div
                        className={cx(
                          "mt-4 rounded-2xl p-4",
                          isDark ? "bg-[#17130f]" : "border border-amber-200 bg-amber-50",
                        )}
                      >
                        <div className={cx("text-[11px] uppercase tracking-[0.18em]", accentTextClass)}>
                          Changes to make now
                        </div>
                        <ul className={cx("mt-3 space-y-2 text-sm", mutedClass)}>
                          {result.tips.map((item) => (
                            <li key={item} className="flex gap-3">
                              <span className={accentTextClass}>&gt;</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
