# 🎈 Baby's First Birthday — Web Invitation

A single-page, scroll-through birthday invitation built with Next.js:
baby photos + a short story about mom & dad while scrolling, a
creative date/venue card with one-tap Google Maps directions, an
RSVP form ("how many from your house are coming"), a self-service
**cancel my RSVP** flow, a live guest-count dashboard for the parents,
and WhatsApp contact buttons at the bottom.

## 1. Customize the content

Everything specific to your event lives in **one file**:

```
lib/config.ts
```

Edit the baby's name, story text, party date/time, venue, Google Maps
search string, and Mom & Dad's WhatsApp numbers there. Nothing else in
the app needs to change.

## 2. Add real photos

Drop your photos into `public/photos/` and point to them from
`lib/config.ts` (`heroPhoto`, and each story item's `photo`). Any
common image format works (`.jpg`, `.png`, `.webp`). Placeholder
illustrations are included so the site looks complete even before you
add real photos.

## 3. Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in DASHBOARD_PASSWORD at minimum
npm run dev
```

Open http://localhost:3000 for the invitation, and
http://localhost:3000/dashboard for the parents' live guest list.

Without Upstash Redis configured, RSVPs are stored in memory only —
fine for trying things out locally, but they reset whenever the dev
server restarts, and **won't work at all in production on Vercel**
(serverless functions don't share memory between requests). Set up
Redis before you go live — it takes two minutes, see below.

## 4. Set up persistent storage (Upstash Redis)

This is what makes the RSVP list and the live dashboard actually
"live" and durable:

1. Go to your project on [vercel.com](https://vercel.com) → **Storage**
   tab → **Create Database** → choose **Upstash Redis** (or install
   the "Upstash" integration from the Vercel Marketplace). It has a
   free tier that's more than enough for a birthday party.
2. Vercel automatically adds `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN` as environment variables to your
   project — no manual copying needed.
3. For local development, copy those same two values into
   `.env.local` if you want local testing to hit real, persistent
   storage instead of the in-memory fallback.

## 5. Set the dashboard passcode

Add an environment variable:

```
DASHBOARD_PASSWORD=something-only-mom-and-dad-know
```

Set it in `.env.local` for local dev, and in your Vercel project's
**Settings → Environment Variables** for production. Whoever knows the
passcode can open `/dashboard` and see the live guest list and guest
count — share it with mom & dad, not with guests.

> This is a lightweight shared-passcode gate, appropriate for a
> family invitation site — not bank-grade auth. Don't reuse a
> password you care about.

## 6. Deploy to Vercel

```bash
npx vercel
```

or connect the repo at [vercel.com/new](https://vercel.com/new). Set
the two environment variables above (`DASHBOARD_PASSWORD` and the two
Upstash ones, if not auto-added) in the Vercel project settings, then
deploy. That's it — Next.js API routes, the RSVP form, and the
dashboard all work out of the box on Vercel's free tier.

## How the RSVP → dashboard → cancel flow works

- A guest fills the form → `POST /api/rsvp` stores a new entry
  (household name, guest count, optional note, status `attending`)
  and returns a private `id` + `token`, which the browser saves in
  `localStorage`. That's what lets the same guest come back later and
  manage their own RSVP without an account.
- The parents' dashboard (`/dashboard`) is passcode-gated and calls
  `GET /api/rsvp` with the passcode in a header. It polls every 6
  seconds, showing the live total guest count, households attending,
  and anyone who's cancelled.
- If plans change, the guest sees a **"Can't make it anymore? Cancel
  RSVP"** button (shown because their saved token is still in their
  browser). This calls `PATCH /api/rsvp/[id]` with their token, which
  is checked against the stored token before anything changes — a
  guest can only touch their own RSVP. The same flow works in reverse
  ("Actually, we can come! Undo cancellation").

## Project structure

```
lib/config.ts              ← all event-specific content (edit this)
lib/storage.ts              ← Redis-backed storage (RSVP persistence)
app/page.tsx                 ← the invitation itself
app/dashboard/page.tsx       ← parents' live guest-list dashboard
app/api/rsvp/route.ts        ← submit RSVP (POST), list for dashboard (GET)
app/api/rsvp/[id]/route.ts   ← cancel / reinstate a single RSVP (PATCH)
app/api/dashboard-auth/route.ts ← passcode check for the dashboard
components/RsvpForm.tsx      ← the RSVP form + cancel/reinstate UI
components/GrowthRail.tsx    ← the scroll-progress "growth chart" rail
components/Reveal.tsx        ← scroll-reveal animation wrapper
public/photos/                ← baby photos (placeholders included)
```

Built with Next.js (App Router) + TypeScript + Tailwind CSS.
