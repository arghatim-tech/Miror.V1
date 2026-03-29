# MIROR

MIROR is a Next.js 16 app for private AI appearance coaching. The current app includes:

- a polished landing page and demo analysis flow
- a real `/pricing` page
- hosted Stripe Checkout for `Coach monthly` and `Pro monthly`
- success and cancel routes for the first billing version

## Local development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_COACH_MONTHLY_PRICE_ID=price_replace_me
STRIPE_PRO_MONTHLY_PRICE_ID=price_replace_me
```

## Stripe flow

- `POST /api/checkout` creates a hosted Stripe Checkout session
- `Coach` and `Pro` buttons redirect to Stripe-hosted subscription checkout
- `/checkout/success` and `/checkout/cancel` are the return pages

This is intentionally the simplest billing version. It does not yet include:

- customer auth
- webhook-based subscription syncing
- gated premium access inside the app

## Deployment and planning docs

- [Deployment and billing guide](docs/deployment-and-billing.md)
- [Analysis backend plan](docs/analysis-backend-plan.md)

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
