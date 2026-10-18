# Lesbian Grindr — Feature List & Implementation Plan

Oct 17, 2026 · @Jake From State Farm


## Product summary

A location-based app where queer women and nonbinary people see who is nearby right now and message them, for dates, friends or hookups. The core loop copies what makes Grindr work: open the app, see a grid of the closest people, tap, chat.

The edge over existing apps for this audience is speed and immediacy, plus strong protection against the two complaints that dominate the category: men and couples posing as women, and empty grids.

- Audience: lesbian, bi, pan and queer women, trans women, and nonbinary people who want a women-centered space. Write the inclusion policy before launch and state it plainly in onboarding; trans-inclusive is the expected default.
- Biggest risks are not code: cold start (an empty grid kills a proximity app) and safety (location leaks, harassment, fake profiles).
- Working name: pick your own. Don't use "Grindr" in the name, store listing or marketing; it is a trademark.

## Feature list

Ship the MVP first: it is the smallest app where two people can find each other nearby and talk safely. Everything else waits until real people are using it.


### MVP (launch)

| Feature | What it does |
| --- | --- |
| Sign up and sign in | Email or phone, plus Sign in with Apple and Google. Date of birth with an 18+ gate. |
| Selfie verification | Live selfie matched to profile photos before a user can message. Verified badge on profiles. |
| Profile | Up to 6 photos, display name, age, pronouns, identity tags (lesbian, bi, queer, trans, nonbinary and more), what you're looking for (chat, friends, dates, relationship, hookups), short bio. |
| Nearby grid | The closest profiles in a scrolling grid, sorted by distance, with rounded distances and an online dot. |
| Filters | Age range, distance, looking for, online now, verified only. |
| Profile view | Full photos and details, a "wave" button, a message button. |
| Chat | One-to-one text and photo messages, read receipts, typing indicator. |
| Block and report | One tap from any profile or chat. A block hides both people from each other permanently. |
| Push notifications | New messages and waves. |
| Privacy settings | Hide distance, hide age, pause profile, delete account in-app. |


### Version 1 (after launch)

| Feature | What it does |
| --- | --- |
| Right Now status | A time-limited flag (for example 1 hour) saying you're free to meet today. |
| Private albums | Photos shared only with people you choose, revocable at any time. |
| Favorites | Star profiles to find them again. |
| Explore / travel mode | Browse a different city before a trip. |
| Voice notes and location sharing | Location sharing in chat expires automatically. |
| Safety check-in | Tell a friend where you're meeting; the app pings them if you don't check in. |
| Subscription | More profiles in the grid, incognito browsing, advanced filters, see who viewed you. |


### Later

- Video calls inside chat
- Events and community board (local meetups, queer nights)
- Friends-only mode
- Group chats
- Web app
- More languages

## Trust and safety

Safety is the product here, not an add-on. Users are trusting you with their sexuality and their location; a leak of either can mean harassment, outing or worse. Build these into the MVP.


### Location privacy

Proximity apps have a known weakness: someone queries distance from several spots and triangulates a user's exact home. Design against it from day one.

- The server stores location; clients never receive another user's coordinates, only a distance label.
- Round distances into buckets (for example "under 1 km", then whole kilometers).
- Snap each stored location to a coarse grid cell or add a fixed per-user random offset, so repeated queries can't converge on a point.
- Rate-limit location updates and grid queries per account and per device.
- "Hide distance" setting, and default it on in countries where being queer is criminalized.
- Never log precise location longer than needed; overwrite, don't append.

### Keeping the space for women and nonbinary people

- Require selfie verification (liveness check matched to profile photos) before messaging.
- Human review queue for flagged or failed verifications, with optional ID check for appeals.
- "Verified only" filter and a visible badge.
- Fast-track reports of men or couples posing as women; ban by device, not just account.

### Moderation

- Report reasons: fake profile, harassment, nudity in public photos, underage, scam or spam, other.
- Automatic image screening on upload; public photos must be non-explicit.
- Explicit photos only in private chat, blurred until the recipient taps to view.
- "Appears underage" reports hide the profile immediately until reviewed.
- A simple admin dashboard to review reports, see history and ban.

### Harassment and account safety

- Block is permanent and two-way.
- Optional filter for offensive first messages.
- Two-factor sign-in, app PIN lock and a discreet app icon option.
- Treat identity tags and orientation as sensitive data: collect only what you need, encrypt at rest.

## Tech stack and architecture

Use one codebase for iOS and Android and a managed backend, so a solo builder working with Codex can ship without running servers. Swap any piece if you already know something else well.

| Layer | Suggested choice | Why |
| --- | --- | --- |
| Mobile app | React Native with Expo (TypeScript) | One codebase for iOS and Android; easy test builds on your phone. |
| Backend, database, auth | Supabase (Postgres) | Auth, database, file storage and realtime in one service. |
| Location queries | PostGIS extension in Postgres | Fast "who is within X km" queries; runs inside Supabase. |
| Chat | Supabase Realtime on a messages table | Live delivery without a separate chat server. |
| Server logic | Supabase Edge Functions or Postgres functions | Distance bucketing, rate limits and verification checks stay on the server. |
| Push notifications | Expo push service (wraps Apple and Google push) | Simplest path from Expo. |
| Selfie / ID verification | A third-party liveness vendor (for example Persona or Veriff) | Don't build face matching yourself. |
| Image moderation | An image moderation API (for example AWS Rekognition or Hive) | Screens uploads for nudity before they go public. |
| Subscriptions | RevenueCat | Handles App Store and Google Play billing in one SDK. |
| Crash and error reporting | Sentry | See what breaks on real phones. |
| Admin dashboard | A small web app (Next.js) on the same Supabase project | Review reports and verifications. |

Rules that keep it safe: turn on Row Level Security for every table; the app reads other users' data only through server functions that return already-rounded distances; keep API keys out of the repo.


## Data model

Ten tables cover the MVP. Location lives in its own table that no user can read directly.

| Table | Key fields | Notes |
| --- | --- | --- |
| profiles | id, display_name, birthdate, pronouns, identities[], looking_for[], bio, verified_at, last_active_at, hide_distance, paused | One row per user, linked to the auth user. |
| photos | id, profile_id, storage_path, position, moderation_status, is_private | Public photos shown only after moderation passes. |
| locations | profile_id, point (PostGIS), grid_cell, updated_at | Never readable by clients; queried only by the nearby function. |
| conversations | id, created_at | One per pair of people. |
| conversation_members | conversation_id, profile_id, last_read_at | Two rows per conversation. |
| messages | id, conversation_id, sender_id, body, media_path, created_at | Realtime subscription per conversation. |
| waves | from_id, to_id, created_at | Lightweight interest signal. |
| blocks | blocker_id, blocked_id, created_at | Checked by every query that returns profiles or messages. |
| reports | id, reporter_id, reported_id, reason, details, status, reviewed_by | Feeds the admin review queue. |
| verifications | profile_id, method, vendor_ref, status, reviewed_by | Selfie and ID results from the vendor. |

The nearby query is one server function: take the caller's location, find profiles within the filter radius, drop blocked, paused and unverified ones, and return each with a bucketed distance label instead of coordinates.


## Phased implementation plan

Build in seven phases, each ending in something you can test on a real phone. Don't start a phase until the previous one's exit check passes.

1. Foundations. Create the Expo app and Supabase project, set up sign-up and sign-in, separate dev and production environments, and store secrets in a .env file that is git-ignored.

   - Exit check: you can sign up and sign in on both an iPhone and an Android phone.
2. Profiles and photos. Onboarding screens, profile editing, photo upload to storage, the moderation hook on upload, the 18+ age gate.

   - Exit check: a new user can finish a profile and only moderated photos appear publicly.
3. Location and the nearby grid. Location permission flow, the locations table, the nearby server function with distance buckets and grid snapping, the grid screen, filters.

   - Exit check: two test phones see each other with a rounded distance, and querying from three spots cannot pin down the other phone's position.
4. Chat and notifications. Conversations, realtime messages, photo messages, read receipts, push notifications.

   - Exit check: messages arrive live when the app is open and as a push when it is closed.
5. Safety layer. Block, report, selfie verification gate before messaging, the admin dashboard, in-app account deletion.

   - Exit check: a report goes into the queue, gets reviewed and leads to a ban that holds on a new account from the same device.
6. Private beta in one city. TestFlight and Google Play internal testing; recruit through local queer events, bars, sports leagues and community groups so the grid isn't empty on day one.

   - Exit check: testers come back on their own during the week and use chat, not just browse.
7. Public launch, then version 1. Store listings, privacy policy and terms, subscriptions, then the version 1 features in order of what beta users ask for most.

   - Exit check: passes App Store and Google Play review.
Launching city by city matters more than any feature: a proximity app with five people nearby feels dead, one with fifty feels alive.


## Legal, privacy and app store requirements

Talk to a lawyer who works with dating or social apps before public launch; this list is a starting checklist, not legal advice.

- [ ] App store rules for user content: both stores expect reporting, blocking, content filtering and a way to contact you. Apple also requires in-app account deletion. Rate the app 18+.
- [ ] Sensitive data: sexual orientation is treated as sensitive personal information under laws like California's privacy law and the EU's GDPR. Get clear consent, collect the minimum, and let users export and delete their data.
- [ ] Location consent: explain why you need location before the system prompt, and honor "hide distance".
- [ ] Biometrics: selfie verification can count as biometric data; some states (Illinois, Texas, Washington) require specific notice and consent. Pick a vendor that handles this.
- [ ] Age verification: rules differ by state and country and keep changing. Check what applies where you launch.
- [ ] Child safety: US platforms must report apparent child sexual abuse material to NCMEC. Have a process before launch.
- [ ] Privacy policy and terms of service: published, linked in the app and store listings, written for this app specifically.
- [ ] Name and branding: clear your app name and logo; avoid other apps' trademarks.
- [ ] Business entity: set up an LLC or similar before taking payments or user data at scale.

## Working with Codex

Give Codex one phase at a time, not the whole app at once; it does much better with a small, testable goal.

1. Export this doc as Markdown and save it in your repository folder as PLAN.md, so Codex can read it.

2. Ask for one phase, for example: "Read PLAN.md. Do Phase 1 only. Use Expo with TypeScript and Supabase. Stop when the exit check can be tested and tell me how to test it."

3. Test the exit check yourself on a real phone.

4. In GitHub Desktop, look over the changed files, then commit with a message like "Phase 1: auth" and push.

5. Move to the next phase.

Check before every commit that no API keys or .env files are in the changed list. For the location and safety phases, ask Codex to explain how its code prevents someone from finding a user's exact location, and push back if the answer is vague.

