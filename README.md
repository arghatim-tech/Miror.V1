# MIROR

MIROR is a Next.js 16 app for private AI appearance coaching. The current app includes:

- a polished landing page and demo analysis flow
- a real Gemini-powered `/api/analyze` route for image analysis
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
GEMINI_API_KEY=replace_with_your_gemini_api_key
```

## Gemini analysis flow

- `POST /api/analyze` accepts the current MIROR upload payload and sends images to Gemini server-side
- the frontend sends the existing preview images to the route and renders the structured JSON in the current result panel
- `GEMINI_API_KEY` stays on the server and is never exposed in the browser bundle

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

## Local run

1. Copy `.env.example` to `.env.local`
2. Add your real `GEMINI_API_KEY` and Stripe values
3. Run `npm install`
4. Run `npm run dev`
5. Open `http://localhost:3000`

## Vercel deploy

1. Open your project in Vercel
2. Go to `Settings -> Environment Variables`
3. Add `GEMINI_API_KEY`
4. Keep the existing Stripe env vars in place
5. Redeploy the project

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
