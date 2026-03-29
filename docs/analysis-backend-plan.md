# Analysis Backend Plan

## Goal

Turn the current mock analysis experience into a real backend that:

- accepts photo uploads
- runs a structured multimodal analysis
- stores results per user
- unlocks paid features based on Stripe subscription status

## Recommended architecture

- Frontend: Next.js on Vercel
- Auth: add a simple hosted auth provider next
- Database: Postgres
- File storage: object storage for uploaded images
- Background jobs: queue or workflow runner for long analysis tasks
- Billing source of truth: Stripe webhooks

## Core backend entities

### `users`

- id
- email
- created_at
- onboarding_state

### `subscriptions`

- user_id
- stripe_customer_id
- stripe_subscription_id
- plan_id
- status
- current_period_end

### `analyses`

- id
- user_id
- mode (`look` or `buy`)
- occasion
- status (`queued`, `processing`, `completed`, `failed`)
- primary_image_url
- result_json
- created_at

### `wardrobe_items`

- id
- user_id
- image_url
- category
- color_tags
- notes

## API shape

### `POST /api/uploads/presign`

- returns a short-lived upload target for the image
- keeps large file transfer away from the analysis request itself

### `POST /api/analyses`

- body: uploaded asset references, mode, occasion, comparison options
- creates an analysis row
- enqueues processing
- returns `analysisId`

### `GET /api/analyses/:id`

- returns processing state plus final structured analysis result

### `GET /api/me/analyses`

- paginated history for paid users

### `GET /api/me/subscription`

- returns current access level for Coach or Pro

### `POST /api/stripe/webhook`

- listens for:
- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.updated`
- `customer.subscription.deleted`

This route becomes the source of truth for paid feature access.

## Analysis pipeline

1. User uploads one or more images.
2. App stores the file and creates an `analyses` record.
3. Worker loads the images and sends them to a multimodal model with a strict response schema.
4. Worker normalizes the model output into the same shape the UI already expects:
   - verdict
   - tone
   - confidence
   - outfit
   - grooming
   - color
   - occasion
   - positives
   - negatives
   - tips
5. Backend stores the final JSON result.
6. UI polls or subscribes for completion.

## Product phases

### Phase 1

- auth
- Stripe webhook sync
- plan-aware access control
- real checkout success tied to a user account

### Phase 2

- real image upload storage
- queued analysis jobs
- history page
- paid plan limits

### Phase 3

- wardrobe memory
- multi-outfit comparison scoring
- saved recommendations
- profile-photo optimization features

## Practical next implementation order

1. Add auth.
2. Add Stripe webhook syncing.
3. Store customer and subscription state in Postgres.
4. Replace mock analysis with queued backend jobs.
5. Add history and wardrobe tables after the first real analysis loop works.
