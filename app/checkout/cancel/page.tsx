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
    <main className="min-h-screen bg-[#050505] px-6 py-16 text-[#efe7da]">
      <div className="mx-auto max-w-3xl border border-[#27211a] bg-[#0a0a0a] p-8 md:p-12">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#c9a84c]">
          Checkout canceled
        </div>
        <h1 className={cx(playfair.className, "mt-4 text-4xl md:text-5xl")}>
          Nothing was charged.
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#8d8476]">
          You can head back to pricing and pick Coach or Pro whenever you are
          ready. Hosted Checkout stays the same, we are just keeping the first
          billing version intentionally simple.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/pricing"
            className="rounded-sm border border-[#c9a84c] bg-[#c9a84c] px-6 py-3 font-semibold text-black transition-colors hover:border-[#d8b865] hover:bg-[#d8b865]"
          >
            Back to pricing
          </Link>
          <Link
            href="/"
            className="rounded-sm border border-[#c9a84c] px-6 py-3 font-semibold text-[#c9a84c] transition-colors hover:bg-[#17130f]"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
