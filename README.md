# PULSE — Keep Your Academic Heartbeat

A premium student productivity platform: attendance tracking, daily coding challenges with
streaks, hackathon board, tasks, notes, focus timer, goals, and real-time study-group chat.

Built with **React 19 + Vite + Tailwind CSS v4 + Firebase** (Auth, Firestore, Storage).

## Features

| Feature | Route | Highlights |
| --- | --- | --- |
| Dashboard | `/dashboard` | Real-time summary cards for every feature, quick task add |
| Attendance | `/attendance`, `/attendance/monthly` | Per-subject targets, progress rings, calendar view, overall stats |
| Challenges | `/challenges` | Daily LeetCode-style challenge, streak engine, 12-week heatmap, reminder banner |
| Hackathons | `/hackathons` | Countdown cards, admin posting with cover-image upload |
| Tasks | `/tasks` | Today/Upcoming/No-date/Completed groups, priorities, due dates |
| Notes | `/notes` | Quick capture, live title search |
| Focus | `/focus` | Pomodoro timer with auto work↔break cycling, session logging |
| Goals | `/goals` | Progress bars, quick updates, completed section |
| Groups | `/groups`, `/groups/:id` | Public discovery + private join codes, real-time chat, pinned messages |

## Getting started

```bash
npm install
npm run dev
```

### 1. Configure Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication** → Sign-in methods: *Email/Password* and *Google*.
3. Create a **Firestore** database and a **Storage** bucket.
4. Project settings → *Your apps* → add a Web app, copy the SDK config.
5. Paste the values into `.env.local` (see `.env.example`).

Without keys the app still boots — the login page shows a notice, and
`VITE_UI_PREVIEW=1` (dev only) lets you browse the UI unauthenticated.

### 2. Deploy security rules

```bash
firebase deploy --only firestore:rules,storage
```

Rules live in `firestore.rules` and `storage.rules`: per-user data is owner-only,
challenges/hackathons are admin-write, group messages are member-only.

### 3. Seed data (optional)

- **Admin**: in Firestore, set `users/{uid}.role = "admin"` for your account.
- **Challenges**: add docs to the `challenges/` collection with
  `{ title, difficulty: "Easy"|"Medium"|"Hard", url, topic, order, description }`.
  If the collection is empty, the app falls back to 7 bundled challenges.
- **Hackathons**: post from the UI as an admin (`+ Post Hackathon`).

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add the six `VITE_FIREBASE_*` environment variables.
3. Add a SPA rewrite so client routes work: `vercel.json` → `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.
4. Add your Vercel domain to Firebase Auth → *Authorized domains*.

## Architecture notes

- `src/config/firebase.js` — SDK init from env vars.
- `src/context/AuthContext.jsx` — auth state + Firestore user profile (`users/{uid}`).
- `src/shared/` — design-system components (Button, Modal, Badge, ProgressRing, Toast…),
  `useFirestoreListener` (auto-unsubscribing `onSnapshot` wrapper), date utils.
- `src/features/<name>/` — `services/` (Firestore writes), `hooks/` (live queries), `components/`, `pages/`.
- Streak updates run in a **Firestore transaction** (`markChallengeDone`) so the
  progress doc and streak stats never diverge; day math uses local-timezone
  `YYYY-MM-DD` ids (see `src/shared/utils/dates.js`).

## Design system

Dark theme (`#09090B` base), indigo→purple gradient primaries, glassmorphic cards
(`card-glass` / `card-elevated` utilities in `src/index.css`), Space Grotesk headings,
Inter body, JetBrains Mono stats. All motion uses `cubic-bezier(0.4, 0, 0.2, 1)`.
