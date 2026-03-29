import { NextRequest, NextResponse } from "next/server";
import { getPaidPlan } from "@/lib/pricing";
import { getStripeServerClient } from "@/lib/stripe";

export const runtime = "nodejs";

type CheckoutPayload = {
  planId?: string;
};

export async function POST(request: NextRequest) {
  let payload: CheckoutPayload;

  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid checkout request body." },
      { status: 400 },
    );
  }

  const plan = getPaidPlan(payload.planId ?? "");

  if (!plan) {
    return NextResponse.json(
      { error: "Unsupported plan selection." },
      { status: 400 },
    );
  }

  const priceId = process.env[plan.stripePriceEnv];

  if (!priceId) {
    return NextResponse.json(
      { error: `Missing ${plan.stripePriceEnv}.` },
      { status: 500 },
    );
  }

  try {
    const stripe = getStripeServerClient();
    const origin = request.headers.get("origin") ?? request.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      success_url: `${origin}/checkout/success`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: {
        planId: plan.id,
        planName: plan.name,
      },
      subscription_data: {
        metadata: {
          planId: plan.id,
          planName: plan.name,
        },
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a hosted checkout URL.");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed.", error);

    return NextResponse.json(
      { error: "Unable to start Stripe Checkout right now." },
      { status: 500 },
    );
  }
}
