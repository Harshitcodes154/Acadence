# Acadence · Academic Timetable Planner

A responsive workspace for setting up an academic week, generating balanced timetables, reviewing drafts, and exporting a copy. Built with Next.js 14, React 18, TypeScript, Tailwind CSS, and Lucide icons.

## Quick start

Use **Node.js 22.6 or newer** (Node 22 LTS recommended) and npm.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000) and choose **Explore demo workspace**. No account, database, or environment variables are required for the demo.

## What works

- Responsive sidebar and planning dashboard, accessible form labels, keyboard focus indicators, and mobile navigation.
- Department, semester, classroom, batch, and subject configuration.
- Five-day timetable generation with balanced subject rotation and a dedicated classroom for every batch.
- Per-batch timetable previews, CSV export of all batches, and a print action for the displayed batch.
- Local draft reviews: approve a plan or request revision with a required note.
- Up to 20 saved timetables per workspace, with explicit confirmation before removal.
- Browser-local persistence, validated saved data, and visible feedback when storage is unavailable.
- Optional Firebase email/password authentication; no client-selected privileged roles.

## Planning workflow

1. Open the demo or sign in.
2. Use **Schedule setup** to enter your department, semester, and resources. The example starts with Computer Science, five subjects, three batches, four rooms, and six periods per day.
3. Add subjects with the **Add subject** button or Enter. Use the remove buttons to adjust the list.
4. Select **Generate timetable**, then choose a batch to inspect its week.
5. Export all batches as CSV, or print the current batch.
6. Open **Review & approve** to approve the draft or record what needs revision. For a revised version, update setup and generate a new draft.

Valid settings save automatically. Incomplete settings remain in memory until corrected. New schedules keep a snapshot of their settings, so changing setup does not alter existing plans. **Load example** replaces setup fields but keeps saved timetables.

## Scheduling rules and limits

| Setting                 | Allowed values                                         |
| ----------------------- | ------------------------------------------------------ |
| Department              | 1–80 characters after trimming                         |
| Semester                | 1–12                                                   |
| Classrooms              | 1–50 whole rooms                                       |
| Batches                 | 1–50 whole batches; no more than classrooms            |
| Periods per day         | 1–8 whole periods                                      |
| Subjects                | 1–40 unique names, each 1–60 characters                |
| Weekly subject coverage | Subject count cannot exceed five times periods per day |
| Saved timetables        | Up to 20 per workspace                                 |
| Review note             | Up to 500 characters; required for revision            |

The scheduler uses deterministic round-robin allocation. Each batch has a dedicated room; each subject receives a weekly lesson count within one of the other subjects. Every batch is scheduled in every period.

**Scope:** room and batch collisions are prevented within one timetable. This is not an AI optimizer or a full institutional constraint solver. Faculty availability, lab equipment, subject-specific contact hours, clock times, breaks, holidays, and collisions across separate saved timetables are not modeled. Period numbers are sequence numbers, not clock times.

## Storage and privacy

Schedules are stored in this browser’s `localStorage`, under a versioned key scoped to the Firebase user ID or the demo workspace. Authenticated schedules are still local; signing in on another device does not synchronize them.

Demo data is shared by everyone using the same browser profile. Signing out leaves locally saved schedules intact. Browser storage is not encrypted or a server authorization boundary; avoid sensitive student information. Export a copy before clearing site data or switching browsers.

If storage is blocked, full, or corrupt, the app displays a warning instead of claiming a successful save. You can continue in memory and export CSV. A valid subsequent save replaces unreadable workspace data. CSV values are quoted and formula-like input is neutralized.

## Optional Firebase sign-in

1. Create a Firebase project and register a web app.
2. Enable Email/Password in Firebase Authentication.
3. Copy `.env.example` to `.env.local`.
4. Replace all four `NEXT_PUBLIC_FIREBASE_*` values with your web app configuration.
5. Add your deployment hostname to Firebase Authentication’s authorized domains.
6. Restart the development server, or rebuild the deployed application.

The current UI only uses Firebase Authentication. Firestore rules, a Firestore database, and user profile documents are not needed for this local planning flow. Account creation does not grant administrator privileges. Never expose service-account credentials in public environment variables.

Missing configuration disables account sign-in and leaves demo mode available. Network failures, invalid credentials, and rate limits produce readable errors. Session initialization has a loading state, and a failed sign-out keeps the current session visible.

## Development and verification

```sh
npm run lint
npm run typecheck
npm test
npm run format
npm run build
npm start
```

The Node test runner checks invalid input, duplicate subjects, room capacity, weekly coverage, deterministic generation, room and batch collisions, balanced allocation, boundary sizes, corrupt schedule records, safe CSV serialization, and rejection of writes to the retired API. The build enforces TypeScript and lint checks. The optional format command runs Prettier on the source files.

Use npm and the committed `package-lock.json`. The previous pnpm lockfile is removed to avoid installing a different dependency tree.

## Project map

```text
app/
  AuthContext.tsx           Firebase session and explicit demo mode
  page.tsx                 Login/workspace entry
  globals.css              Shared design tokens and print styles
components/
  dashboard.tsx            Navigation, local persistence, schedule lifecycle
  login-form.tsx           Sign-in, registration, demo entry
  parameter-form.tsx       Academic setup and subject validation
  timetable-generator.tsx  Batch timetable, CSV export, printing
  review-workflow.tsx       Review queue and review notes
lib/
  scheduler.ts             Pure validation, generation, and export functions
  firebaseClient.ts        Optional Firebase initialization
tests/
  scheduler.test.mjs       Scheduling and export regression tests
```

## Deployment

Build with Node 22 and deploy through a Next.js-compatible host. The Netlify configuration uses its Next.js plugin; an SPA rewrite to `/index.html` is not required. Set the optional Firebase public variables before the build because Next.js includes them in the client bundle.

## Legacy files

The Supabase migrations, setup notes, and Firestore migration script remain as historical integration scaffolding. They are not part of the current frontend runtime and do not enable cloud storage by themselves. The migration script requires separate administrative credentials and writes to Firestore; review it before running it.

`npm run server` starts an optional legacy Express process on loopback port 5000. Its health route is available, but the old `POST /api/timetables/select` route returns **410 Gone**. That prototype decoded tokens without verification and is deliberately disabled. The frontend does not use it. This README supersedes the older deployment and product-roadmap claims; PWA/offline caching, notifications, institutional role enforcement, and cloud synchronization are not implemented.
