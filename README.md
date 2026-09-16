# MTB Attendance

A personal attendance tracker for a single user: tap once to check in, once to check out, and export a PDF attendance sheet for any date range.

## Stack

Single Next.js project (App Router) deployed as one Vercel app — no separate backend service.

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **API**: Next.js Route Handlers under `frontend/app/api/*`
- **Database**: MongoDB via Mongoose, with a cached connection for serverless (`frontend/lib/db.ts`)
- **PDF generation**: Puppeteer locally, `puppeteer-core` + `@sparticuz/chromium` in production (`frontend/lib/browser.ts`)

## Structure

```
frontend/
  app/
    page.tsx              # Home: check-in / check-out / mark-absent
    history/page.tsx       # Edit/delete past records
    report/page.tsx        # Generate a PDF report for a date range
    api/
      checkin/route.ts
      checkout/route.ts
      absent/route.ts
      records/route.ts
      records/[id]/route.ts
      report/route.ts      # Renders the PDF via headless Chromium
  lib/
    db.ts                  # Cached Mongoose connection
    models/AttendanceRecord.ts
    profile.ts             # Hardcoded profile used on the report header
    browser.ts             # Puppeteer/Chromium launcher (dev vs. serverless)
```

The reporter's profile (name, ID, role, institution) is fixed in `frontend/lib/profile.ts` since it never changes — there's no settings UI or profile model.

## Getting started

```bash
cd frontend
npm install
cp .env.example .env   # set MONGO_URI
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Deploy the `frontend/` directory to Vercel with `MONGO_URI` set as an environment variable.
