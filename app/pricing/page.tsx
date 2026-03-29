import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { PricingGrid } from "@/components/pricing-grid";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#090806] text-[#f5efe4]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 18% 12%, rgba(210,171,85,0.16), transparent 30%), radial-gradient(circle at 82% 22%, rgba(210,171,85,0.11), transparent 24%), radial-gradient(circle at 50% 0%, rgba(210,171,85,0.08), transparent 38%), linear-gradient(180deg, rgba(12,10,8,0.98), rgba(7,6,5,1))",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm text-[#b3a693] transition-colors hover:text-[#f5efe4]"
          >
            Back to home
          </Link>
          <div className="rounded-sm border border-[#d2ab55] px-4 py-2 text-sm text-[#d2ab55]">
            Hosted Stripe Checkout
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex border border-[#d2ab55] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#d2ab55]">
            Pricing
          </div>
          <h1 className={cx(playfair.className, "mt-6 text-5xl md:text-6xl")}>
            Start simple. Let Stripe handle the billing.
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#b3a693]">
            Coach and Pro now open a hosted Stripe Checkout session. No custom
            billing UI yet, just the fastest clean path to paid subscriptions.
          </p>
        </div>

        <PricingGrid isDark />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="border border-[#3a3025] bg-[#13100d] p-8">
            <div className="text-[11px] uppercase tracking-[0.22em] text-[#d2ab55]">
              What happens now
            </div>
            <h2 className={cx(playfair.className, "mt-3 text-3xl")}>
              Payment is real. Access automation is next.
            </h2>
            <p className="mt-3 text-[#b3a693]">
              This launch keeps billing deliberately simple: Stripe hosts the
              payment page, and the app can add webhooks, auth, and paid-feature
              unlocking in the next backend phase.
            </p>
          </div>

          <div className="border border-[#3a3025] bg-[#13100d] p-8">
            <div className="text-[11px] uppercase tracking-[0.22em] text-[#d2ab55]">
              Deployment notes
            </div>
            <h2 className={cx(playfair.className, "mt-3 text-3xl")}>
              Ready for Vercel with env vars.
            </h2>
            <p className="mt-3 text-[#b3a693]">
              Add the Stripe secret key plus both recurring price IDs in Vercel,
              redeploy, and the checkout buttons will start redirecting to hosted
              Checkout immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
