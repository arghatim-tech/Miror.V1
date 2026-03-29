"use client";

import { type ReactNode, useState } from "react";
import type { PaidPlanId } from "@/lib/pricing";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type CheckoutButtonProps = {
  planId: PaidPlanId;
  children: ReactNode;
  className?: string;
  errorClassName?: string;
};

export function CheckoutButton({
  planId,
  children,
  className,
  errorClassName,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; url?: string }
        | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error ?? "Unable to start checkout right now.");
      }

      window.location.assign(payload.url);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to start checkout right now.",
      );
      setIsLoading(false);
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={isLoading}
        className={cx(
          "w-full rounded-sm px-5 py-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        {isLoading ? "Redirecting..." : children}
      </button>
      {error ? (
        <p className={cx("mt-3 text-sm text-red-400", errorClassName)}>{error}</p>
      ) : null}
    </div>
  );
}
