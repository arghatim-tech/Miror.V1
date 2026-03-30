import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-[#090806] px-6 py-16 text-[#fff6eb]">
      <div className="mx-auto max-w-3xl border border-[#3a3025] bg-[#13100d] p-8 md:p-12">
        <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-400">
          Checkout complete
        </div>
        <h1 className={cx(playfair.className, "mt-4 text-4xl md:text-5xl")}>
          Stripe says you are in.
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#cabdab]">
          The subscription purchase completed successfully. The next backend step
          is wiring Stripe webhooks to unlock paid features automatically inside
          MIROR.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-sm border border-[#d2ab55] bg-[#d2ab55] px-6 py-3 font-semibold text-[#1a140b] transition-colors hover:border-[#e1bf68] hover:bg-[#e1bf68]"
          >
            Back to home
          </Link>
          <Link
            href="/pricing"
            className="rounded-sm border border-[#d2ab55] px-6 py-3 font-semibold text-[#d2ab55] transition-colors hover:bg-[#211a13]"
          >
            View plans
          </Link>
        </div>
      </div>
    </main>
  );
}
