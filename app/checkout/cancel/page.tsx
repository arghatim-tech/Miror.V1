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

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen bg-[#090806] px-6 py-16 text-[#f5efe4]">
      <div className="mx-auto max-w-3xl border border-[#3a3025] bg-[#13100d] p-8 md:p-12">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#d2ab55]">
          Checkout canceled
        </div>
        <h1 className={cx(playfair.className, "mt-4 text-4xl md:text-5xl")}>
          Nothing was charged.
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#b3a693]">
          You can head back to pricing and pick Coach or Pro whenever you are
          ready. Hosted Checkout stays the same, we are just keeping the first
          billing version intentionally simple.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/pricing"
            className="rounded-sm border border-[#d2ab55] bg-[#d2ab55] px-6 py-3 font-semibold text-[#1a140b] transition-colors hover:border-[#e1bf68] hover:bg-[#e1bf68]"
          >
            Back to pricing
          </Link>
          <Link
            href="/"
            className="rounded-sm border border-[#d2ab55] px-6 py-3 font-semibold text-[#d2ab55] transition-colors hover:bg-[#211a13]"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
