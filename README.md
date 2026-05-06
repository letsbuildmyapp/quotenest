# QuoteNest

**A portfolio showcase by [Lets Build My App](https://letsbuildmyapp.com).** Friendly, instant solar quotes — a 90-second wizard that generates a real cost estimate and routes the lead into an internal CRM.

> Real backend wiring (Firebase Auth + Firestore + Cloud Functions + Resend), real estimate engine, real CSV export. Built end-to-end against the Firebase emulator suite — no production project needed to run locally.

---

## Visual identity (locked)

| Choice | Value |
|---|---|
| Archetype | Playful / illustrative |
| Display font | Clash Display |
| Text font | Inter |
| Primary | Sun (warm orange `#fb7c14`) |
| Secondary | Grape (`#8047ff`) |
| Radius | `rounded-2xl` → `rounded-4xl` |
| Hero | Hand-rolled SVG illustration (sunny house) |
| Shadow language | Hard "pop" shadow (`shadow-pop`) |

---

## Stack

- **Frontend:** React 19 + Vite + TS, Tailwind, React Router v7, TanStack Query, Zustand, react-hook-form + Zod, Framer Motion, Sonner, lucide-react.
- **Quiz engine:** declarative schema in `src/quiz/schema.ts` with `next(answers)` resolvers — branching is data-driven, never hardcoded if/else.
- **State persistence:** Zustand `persist` to `localStorage` (`quotenest-quiz-v1`).
- **Backend:** Firebase Auth, Firestore, Cloud Functions (Node 20, TS).
- **Email:** Resend + react-email template, sent from `sendQuoteEmail` callable function.
- **SMS:** mocked — logged to browser console + admin sees a success toast.
- **Admin:** Firebase Auth-gated kanban with hot/warm/cold filters, search, CSV export.

---

## Run locally (against Firebase emulators)

```bash
# 1. Install
npm install
npm --prefix functions install

# 2. Build the Cloud Functions (compiles TS so the emulator can serve them)
npm run functions:build

# 3. Start the emulator suite (Firestore + Auth + Functions + UI on :4000)
npm run emulators

# 4. In a second terminal: seed demo leads
npm run seed

# 5. In a third terminal: run the Vite dev server
npm run dev
```

Then open:

- App: <http://localhost:5173>
- Quiz: <http://localhost:5173/quiz>
- Admin: <http://localhost:5173/admin> (creds prefilled: `admin@quotenest.test` / `quotenest-admin` — auto-created on first sign-in via the Auth emulator)
- Firebase emulator UI: <http://localhost:4000>

---

## Real Resend sending

By default, `sendQuoteEmail` logs an HTML preview to the emulator console when no API key is set. To actually send:

```bash
cp functions/.env.example functions/.env
# add RESEND_API_KEY=re_xxx and a verified QUOTE_FROM_EMAIL
npm run functions:build
npm run emulators
```

The frontend always gets a successful response — the difference is whether the email actually leaves Resend.

---

## Production handoff (Alex's checklist)

1. Create the real Firebase project: `firebase projects:create quotenest-demo` (or pick another id and update `.firebaserc`).
2. Create two Hosting sites: `quotenest-staging` and `quotenest`.
3. `firebase target:apply hosting staging quotenest-staging`
4. `firebase target:apply hosting production quotenest`
5. Drop real Firebase web config into `.env.local`:
   ```
   VITE_FB_API_KEY=...
   VITE_FB_AUTH_DOMAIN=...
   VITE_FB_PROJECT_ID=...
   VITE_FB_STORAGE_BUCKET=...
   VITE_FB_MSG_SENDER_ID=...
   VITE_FB_APP_ID=...
   VITE_USE_EMULATOR=false
   ```
6. Set Resend secret on Functions:
   ```
   firebase functions:secrets:set RESEND_API_KEY
   ```
7. Deploy: `npm run build && firebase deploy --only hosting:staging,functions,firestore:rules`
8. Confirm staging URL works end-to-end → then `firebase deploy --only hosting:production`.

---

## File map (the bits worth reading)

- `src/quiz/schema.ts` — declarative quiz with branching
- `src/quiz/estimate.ts` — pricing engine + lead scoring
- `src/store/quizStore.ts` — persisted Zustand quiz state
- `src/lib/leads.ts` — Firestore wrapper + Resend Cloud Function call
- `src/lib/share.ts` — base64 URL encoding for shareable result links
- `src/lib/csv.ts` — CSV export
- `src/pages/admin/Dashboard.tsx` — kanban + filters + export
- `functions/src/index.ts` + `functions/src/emails/QuoteEmail.tsx` — Resend + react-email
