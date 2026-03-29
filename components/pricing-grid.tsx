"use client";

import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { CheckoutButton } from "@/components/checkout-button";
import { pricingPlans } from "@/lib/pricing";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type PricingGridProps = {
  isDark: boolean;
  onFreePlanClick?: () => void;
};

export function PricingGrid({
  isDark,
  onFreePlanClick,
}: PricingGridProps) {
  const accentTextClass = isDark ? "text-[#c9a84c]" : "text-amber-800";
  const accentBorderClass = isDark ? "border-[#c9a84c]" : "border-amber-800";
  const accentButtonClass = cx(
    "transition-colors",
    isDark
      ? "border border-[#c9a84c] bg-[#c9a84c] text-black hover:border-[#d8b865] hover:bg-[#d8b865]"
      : "border border-amber-800 bg-amber-800 text-white hover:border-amber-900 hover:bg-amber-900",
  );
  const mutedClass = isDark ? "text-[#8d8476]" : "text-[#6f6658]";
  const panelClass = cx(
    "border p-8 transition-colors duration-300",
    isDark ? "border-[#27211a] bg-[#0a0a0a]" : "border-[#ddd3c1] bg-[#fffdf8]",
  );
  const sectionDividerClass = isDark ? "bg-[#1d1a16]" : "bg-[#ddd3c1]";

  return (
    <div className={cx("mt-14 grid gap-px md:grid-cols-3", sectionDividerClass)}>
      {pricingPlans.map((plan) => (
        <div
          key={plan.id}
          className={cx(panelClass, plan.featured && "ring-1 ring-[#c9a84c]/40")}
        >
          <div className={cx("text-[11px] uppercase tracking-[0.22em]", accentTextClass)}>
            {plan.name}
          </div>
          <div className={cx(playfair.className, "mt-4 text-5xl")}>{plan.price}</div>
          <p className={cx("mt-4 leading-7", mutedClass)}>{plan.subtitle}</p>
          <ul className="mt-6 space-y-3 text-sm">
            {plan.features.map((feature) => (
              <li key={feature} className={cx("flex gap-3", mutedClass)}>
                <span className={accentTextClass}>+</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {plan.kind === "paid" ? (
            <CheckoutButton
              planId={plan.id}
              className={
                plan.featured
                  ? accentButtonClass
                  : cx("border", accentBorderClass, accentTextClass)
              }
              errorClassName={isDark ? "text-red-300" : "text-red-700"}
            >
              {plan.cta}
            </CheckoutButton>
          ) : onFreePlanClick ? (
            <button
              type="button"
              onClick={onFreePlanClick}
              className={cx(
                "mt-8 w-full rounded-sm border px-5 py-3 font-semibold transition-colors",
                accentBorderClass,
                accentTextClass,
              )}
            >
              {plan.cta}
            </button>
          ) : (
            <Link
              href="/#demo"
              className={cx(
                "mt-8 flex w-full items-center justify-center rounded-sm border px-5 py-3 font-semibold transition-colors",
                accentBorderClass,
                accentTextClass,
              )}
            >
              {plan.cta}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
