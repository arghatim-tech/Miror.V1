export type PaidPlanId = "coach-monthly" | "pro-monthly";
export type PlanId = "free" | PaidPlanId;

type BasePlan = {
  id: PlanId;
  name: string;
  price: string;
  subtitle: string;
  features: readonly string[];
  cta: string;
  featured: boolean;
};

type FreePlan = BasePlan & {
  kind: "free";
  stripePriceEnv: null;
};

type PaidPlan = BasePlan & {
  kind: "paid";
  stripePriceEnv:
    | "STRIPE_COACH_MONTHLY_PRICE_ID"
    | "STRIPE_PRO_MONTHLY_PRICE_ID";
};

export type PricingPlan = FreePlan | PaidPlan;

export const pricingPlans = [
  {
    id: "free",
    kind: "free",
    name: "Free",
    price: "$0",
    subtitle: "For testing the product without commitment.",
    features: [
      "1 analysis after rewarded ad",
      "Basic look or item review",
      "Single photo upload",
      "No wardrobe memory",
      "No ads-free mode",
    ],
    cta: "Try Free",
    featured: false,
    stripePriceEnv: null,
  },
  {
    id: "coach-monthly",
    kind: "paid",
    name: "Coach",
    price: "$9/mo",
    subtitle: "Best starting plan for actual repeat use.",
    features: [
      "Unlimited analyses",
      "Up to 3 outfit comparisons",
      "Hair and grooming recommendations",
      "Current look and buy-this-item mode",
      "Ads removed",
      "History saved",
    ],
    cta: "Start Coach",
    featured: true,
    stripePriceEnv: "STRIPE_COACH_MONTHLY_PRICE_ID",
  },
  {
    id: "pro-monthly",
    kind: "paid",
    name: "Pro",
    price: "$19/mo",
    subtitle: "For power users and future premium features.",
    features: [
      "Everything in Coach",
      "Wardrobe memory",
      "Unlimited wardrobe uploads",
      "Priority processing",
      "Future haircut simulation",
      "Future profile-photo optimization",
    ],
    cta: "Go Pro",
    featured: false,
    stripePriceEnv: "STRIPE_PRO_MONTHLY_PRICE_ID",
  },
] as const satisfies readonly PricingPlan[];

export function getPricingPlan(planId: string): PricingPlan | undefined {
  return pricingPlans.find((plan) => plan.id === planId);
}

export function getPaidPlan(planId: string): PaidPlan | undefined {
  const plan = getPricingPlan(planId);
  return plan?.kind === "paid" ? plan : undefined;
}
