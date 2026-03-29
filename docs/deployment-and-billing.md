# Deployment and Billing

## 1. Push the repo to GitHub

1. Make sure this project has an initial commit on `main`.
2. Push it to `arghatim-tech/Miror.V1`.
3. Confirm the repo contains the latest app code before importing it into Vercel.

## 2. Deploy the app to Vercel

1. Open Vercel and choose **Add New Project**.
2. Import the `arghatim-tech/Miror.V1` repository.
3. Let Vercel auto-detect **Next.js**.
4. Keep the default build command as `next build`.
5. Keep the default output setting that Vercel chooses for Next.js.
6. Before the first production deploy, add the Stripe environment variables listed below.
7. Deploy.

## 3. Stripe environment variables

Add these in Vercel for `Production`, `Preview`, and `Development`:

```bash
STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_COACH_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
```

For local development, copy `.env.example` to `.env.local` and fill in the same values.

## 4. Create the Stripe plans

1. In Stripe Dashboard, stay in **Test mode** first.
2. Create a product named `Coach monthly`.
3. Add a **recurring monthly** price for Coach.
4. Create a product named `Pro monthly`.
5. Add a **recurring monthly** price for Pro.
6. Copy both generated `price_...` IDs into the matching env vars.
7. Redeploy Vercel after adding or changing env vars.

Suggested launch pricing:

- Coach monthly: `$9/month`
- Pro monthly: `$19/month`

## 5. What the app already does

- `/pricing` renders the real plans.
- `POST /api/checkout` creates a hosted Stripe Checkout session.
- Coach and Pro buttons redirect to Stripe-hosted subscription checkout.
- `/checkout/success` and `/checkout/cancel` handle the post-checkout landing pages.

## 6. What is intentionally not built yet

- No custom billing portal UI
- No subscription gating inside the app
- No webhook-based provisioning yet
- No auth-linked customer records yet

That is deliberate for the first release. Billing is kept to the smallest working shape so deployment is easy and risk stays low.
