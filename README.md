# Support Satyam Tiwari

A premium, animated support page for Satyam's AI and software-building journey. It is built with Next.js App Router, TypeScript, Prisma/Neon, Razorpay, Zod, and Framer Motion.

## What is included

- Responsive dark-mode landing page with animated aurora, floating UI, live counters, contribution tiers, supporter wall, and Razorpay checkout.
- Secure payment flow: the server creates Razorpay orders, saves a `CREATED` record, verifies the Razorpay signature on the server, then marks it `PAID`.
- Optional name, email, message, and anonymous contribution support.
- A password-protected `/admin` dashboard with payment search, status filters, top supporters, and CSV export.
- A celebratory `/success` page after a verified payment.

## Local setup

1. Install Node.js 20.9 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment template and fill in the values:

   ```bash
   Copy-Item .env.example .env
   ```

4. Create a Neon PostgreSQL database, set `DATABASE_URL`, then generate and apply the schema:

   ```bash
   npm run db:generate
   npm run db:migrate -- --name init
   ```

5. Add Razorpay **Test Mode** keys (`rzp_test_...`) to `.env`, then start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). Visit `/admin` and sign in with `ADMIN_PASSWORD`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon/PostgreSQL connection string |
| `RAZORPAY_KEY_ID` | Razorpay public key; use a Test Mode key locally |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key; server-only |
| `RAZORPAY_WEBHOOK_SECRET` | Secret for verified Razorpay reconciliation webhooks |
| `ADMIN_PASSWORD` | Password for the private dashboard |
| `ADMIN_COOKIE_SECRET` | Random 32+ character secret for signed admin cookies |

Never prefix secret values with `NEXT_PUBLIC_`, commit `.env`, or expose the Razorpay key secret in the browser.

## Razorpay configuration

The checkout only opens after the server has created an order. The success handler posts the returned order ID, payment ID, and signature to `/api/payments/verify`; that endpoint uses `RAZORPAY_KEY_SECRET` to verify the signature before the payment record becomes `PAID`.

For production, add a Razorpay webhook pointing to `https://your-domain.com/api/webhooks/razorpay`, subscribe to `payment.captured`, `payment.failed`, and `order.paid`, and set its secret as `RAZORPAY_WEBHOOK_SECRET`. The handler validates the raw-body signature and reconciles a matching `razorpayOrderId` idempotently if a browser closes before client verification finishes. Keep Test Mode enabled until the full flow is verified.

## Deploying to Vercel

1. Push this project to GitHub and import it in Vercel.
2. Add all five environment variables in Vercel project settings.
3. Use a pooled Neon connection string compatible with serverless functions.
4. Run `npx prisma migrate deploy` during your deployment/release process.
5. Verify a Test Mode contribution, the `/success` redirect, admin login, and CSV export before switching Razorpay to Live Mode.

## Future improvements

- Use an email provider for contributor receipts.
- Add rate limiting / bot protection around payment and admin routes.
- Replace placeholder social links and add a real profile image in `public/`.
- Add a database-backed public supporter cache or ISR for very high traffic.
