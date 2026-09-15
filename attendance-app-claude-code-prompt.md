# Build: Personal Attendance Manager (Web + Mobile-friendly)

Build a complete, working, full-stack attendance tracking application for a single user (an intern logging daily check-in/check-out). Use **Next.js** (frontend, App Router), **Express.js** (backend REST API), and **MongoDB** (via Mongoose) for the database. Keep the UI extremely simple — this app has exactly one main job: let me tap a button once in the morning and once in the evening, and let me export a report that looks exactly like a specific reference table.

Do not stop after writing the code. Install all dependencies, start both the backend and frontend, hit every API endpoint to confirm it works, exercise the UI flows, fix any bugs you find, and only report back once the whole system runs end-to-end without errors.

## Tech stack & structure

```
/attendance-app
  /backend      -> Express + Mongoose API server
  /frontend     -> Next.js app (App Router), mobile-responsive
```

- Backend: Node.js + Express + Mongoose + MongoDB (assume local MongoDB at `mongodb://localhost:27017/attendance`, configurable via `.env`)
- Frontend: Next.js (latest stable), plain CSS or Tailwind (your choice, keep it minimal and clean), fetch calls to the Express API
- Use `dayjs` (with timezone plugin) on the backend for all date/time handling. **All server date/time logic must run in `Asia/Dhaka` timezone**, not UTC — this is critical, since check-in/out timestamps and "today's date" must reflect Bangladesh local time regardless of server location.
- No auth system needed (single personal user), but structure the code so one could be added later without a rewrite.

## Data model

**AttendanceRecord** (one document per calendar day):
| Field | Type | Notes |
|---|---|---|
| date | String `YYYY-MM-DD` | unique index |
| day | String | full weekday name, auto-derived from `date` |
| checkIn | String or null | formatted `h:mm A` (e.g. `9:38 AM`) |
| checkOut | String or null | formatted `h:mm A` |
| status | String | `Present` / `Absent` / `Late` |
| late | String | `Yes` / `No` |
| remarks | String | free text, manual only |
| notes | String | free text, manual only (e.g. "Sick leave", "Supervisor Visit") |

**Profile** (single settings document, seeded on first run, editable later):
| Field | Example |
|---|---|
| name | Marzia Hossain |
| studentId | 2022-2-10-259 |
| role | Intern |
| institution | East West University |
| unit | Process Re-engineering and Optimization Unit |
| division | Digital Banking Division |

## Business logic (must match this exactly)

- **Check In button**: creates (or updates, if somehow re-clicked) today's record. Sets `date`, `day` (auto), `checkIn` = current time in Asia/Dhaka. Determines `late`:
  - If check-in time is **after 10:00 AM** → `late = "Yes"`, `status = "Late"`
  - Otherwise → `late = "No"`, `status = "Present"`
  - Button should be disabled/greyed out once today's check-in already exists, with a clear "Already checked in at X" message.
- **Check Out button**: updates `checkOut` on today's existing record with current time. Disabled until check-in exists for today; disabled again once check-out is recorded (show "Already checked out at X").
- **Mark Absent button**: for a day with no check-in (e.g. sick leave) — creates/updates today's (or a manually picked past) record with `status = "Absent"`, `late = "No"`, empty check-in/out, and lets me type a note (e.g. "Sick leave") right there.
- **Manual edit**: every record in the history table should be editable inline (or via a small edit modal) for `remarks`, `notes`, and status correction — in case I need to fix something after the fact.
- Auto-fill `day` from `date` on every record, computed server-side (don't trust client-sent day names).
- Prevent duplicate records for the same date (upsert by `date`).

## API endpoints (Express)

- `POST /api/checkin` — checks in for today (see logic above)
- `POST /api/checkout` — checks out for today
- `POST /api/absent` — marks a given date (default today) absent, accepts optional note
- `GET /api/records?start=YYYY-MM-DD&end=YYYY-MM-DD` — list records in range, sorted by date ascending
- `PUT /api/records/:id` — manual edit (remarks, notes, status, late, times)
- `DELETE /api/records/:id` — delete a record (in case of mistakes)
- `GET /api/profile` / `PUT /api/profile` — read/update the header info used in reports
- `GET /api/report?start=YYYY-MM-DD&end=YYYY-MM-DD` — generates and returns a **PDF** of the report (see format below) for the given date range

## Report generation — must visually match the reference exactly

I'm attaching a reference image. Replicate its layout precisely:

1. **Header block** (left-aligned, plain text above the table):
   - Line 1: `Attendance Sheet of {name}`
   - Line 2: `{studentId}, {role}, {institution}`
   - Line 3: `{unit}, {division}`
2. **Table**, full grid borders (thin black lines, Excel-style), columns in this exact order:
   `Date | Day | Check In | Check Out | Status | Late | Remarks | Notes`
   - Date format: `YYYY-MM-DD`
   - Time format: `h:mm AM/PM`
   - One row per day in the selected range, in ascending date order
   - Empty cells (e.g. Check In/Out on an Absent day) stay blank, not "N/A"
3. Use **Puppeteer** on the backend: render an HTML/CSS page matching this layout, then generate a PDF from it (simplest reliable way to pixel-match an Excel-style bordered table). Return the PDF as a file download.
4. The date range for the report must be selectable for **any** start/end date, not just full months.

## Frontend pages (Next.js, mobile-responsive)

1. **Home / Dashboard** (`/`):
   - Today's date and day, shown large
   - Two big, thumb-friendly buttons: **Check In** and **Check Out** (disabled states as described above)
   - A smaller **Mark Absent** button/link
   - Quick view of today's record status
2. **History** (`/history`):
   - Table of all records (paginated or scrollable), each row editable inline for remarks/notes/status
   - Simple date-range filter
3. **Report** (`/report`):
   - Start date and end date pickers
   - "Generate Report" button → calls `/api/report` and downloads the PDF
4. **Settings** (`/settings`):
   - Edit the profile fields used in the report header

Keep styling minimal, clean, large tap targets, and responsive down to a ~375px mobile viewport. No login screen, no unnecessary complexity.

## Build & verification steps (do all of this before finishing)

1. Scaffold both `/backend` and `/frontend`, install all dependencies (including `express`, `mongoose`, `cors`, `dotenv`, `dayjs`, `puppeteer` for backend; standard Next.js deps for frontend).
2. Write a `.env.example` for both apps (Mongo URI, ports, etc.).
3. Seed the Profile collection with the example values above on first run if none exists.
4. Start MongoDB (or confirm it's running), start the backend, start the frontend.
5. Test every API endpoint with curl or a script: check-in, check-out, mark-absent, list records, edit a record, generate a report PDF — confirm real responses, not assumptions.
6. Walk through the UI flows (check in → check out → view in history → edit remarks → generate report) and fix any bugs, broken states, or console errors you encounter.
7. Confirm the generated PDF's layout visually matches the described format (open/inspect the PDF output).
8. Once everything runs cleanly, give me a short summary of how to run it locally (commands for both servers, required env vars, MongoDB requirement) and note anything I should double check.

Ask me clarifying questions only if something is truly ambiguous — otherwise use the sensible defaults above and just build it.
