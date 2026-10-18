# Build Runbook — Phase by Phase

Oct 17, 2026 · @Jake From State Farm

Every step from an empty folder to a launched app, with the exact prompt to give Codex and how to check its work. It follows the phases in the Feature List & Implementation Plan doc.


## How to use this runbook

Do one step at a time. Every step follows the same loop, and you commit after every step that works.

1. Prompt: paste the step's Codex prompt (in the grey box) into Codex with your project folder open.

2. Read: when Codex finishes, ask it "Summarize what you changed and why, in plain words."

3. Test: do the step's test yourself. If it fails, paste the exact error into Codex and ask it to fix it.

4. Commit: in GitHub Desktop, check the changed files (no .env files, no keys), write a short summary like "Phase 2: photo upload", click Commit, then Push.

Two habits save a lot of pain: start each Codex session with "Read PLAN.md and RUNBOOK.md first", and never move on with a failing test. If Codex goes in circles three times on the same error, commit what works, start a fresh Codex chat, and describe the problem from scratch.


## Before you start

Set these up once. The free tiers are enough until beta; the two store accounts are the only required spend before launch. Prices are approximate, so check each site.


### Accounts

| Account | When you need it | Cost |
| --- | --- | --- |
| GitHub | Now (you have it) | Free |
| Supabase | Phase 1 | Free tier; paid plan around $25/month at launch |
| Expo (EAS) | Phase 1 | Free tier for builds |
| Apple Developer Program | Phase 1, to install test builds on an iPhone | $99/year |
| Google Play Console | Phase 6 | $25 one-time |
| Sentry | Phase 1 | Free tier |
| Image moderation API (AWS or Hive) | Phase 2 | Pay per image; small at beta scale |
| Verification vendor (Persona, Veriff or similar) | Phase 5 | Per check; ask for startup pricing |
| RevenueCat | Phase 7 | Free until meaningful revenue |
| A domain name | Phase 7, for privacy policy and support email | Around $12/year |


### Tools on your computer

- [ ] Node.js (LTS version) from nodejs.org
- [ ] GitHub Desktop and your repository (done)
- [ ] Codex in the ChatGPT desktop app, pointed at your repository folder (done)
- [ ] VS Code or another code editor, to read files Codex writes

### On your phone

- [ ] Your own iPhone or Android phone for testing; ideally borrow a second phone of the other type
- [ ] A second test account (a friend's phone or a second device) for testing the grid and chat between two people

## Phase 1 — Foundations

Goal: an app on your phone where you can sign up, sign in and sign out, connected to a database. No features yet.


### Step 1.1 — Put the plans in the repo

1. Export the Feature List & Implementation Plan doc and this runbook as Markdown.

2. Save them in your repository folder as PLAN.md and RUNBOOK.md.

3. Commit and push: "Add plan and runbook".


### Step 1.2 — Create the app

Read PLAN.md and RUNBOOK.md. We are starting Phase 1.

Create a new Expo app in this folder using TypeScript and Expo Router.

Set up folders: app/ for screens, src/components, src/lib, src/hooks, supabase/ for database migrations.

Add a .gitignore that excludes node_modules, .env, .env.*, and build output.

Add ESLint and Prettier. Add a README explaining how to run the app.

Tell me the exact commands to run it and see it on my phone.

Test: run the command Codex gives you (usually npx expo start) and open the app on your phone. You should see a placeholder screen.


### Step 1.3 — Create two Supabase projects (you do this, not Codex)

1. At supabase.com, create a project called "yourapp-dev" and save the database password somewhere safe.

2. Create a second project called "yourapp-prod". You won't touch it until Phase 6.

3. In the dev project, go to Project Settings → API and copy the Project URL and the anon (public) key.

4. Never copy the service_role key into the app. It is for servers only.


### Step 1.4 — Connect the app to Supabase

Install @supabase/supabase-js and set up a Supabase client in src/lib/supabase.ts.

Read the URL and anon key from EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.

Create .env.example with those names and empty values. Do not create a real .env.

Store the auth session securely on the device (expo-secure-store).

Set up the Supabase CLI in supabase/ so all database changes are migration files in git.

Then create a file named .env yourself, paste in the real values, and confirm GitHub Desktop does not list it as a change.


### Step 1.5 — Sign up, sign in, sign out

Build auth screens: welcome, sign up with email (6-digit code sent by email, no password), sign in, and a signed-in home screen with a sign-out button.

On sign up, ask for date of birth and block anyone under 18 with a clear message.

Use Expo Router groups so signed-out users only see auth screens.

Add loading and error states to every screen.

Test: sign up with your email, enter the code, sign out, sign in again. Try a birth date under 18 and confirm it is blocked.


### Step 1.6 — Development builds

Some features later (push notifications, payments, verification) don't work in the Expo Go app, so switch to a development build now.

Set up EAS Build with a development profile for iOS and Android, and a preview and production profile.

Add app.config.ts with a placeholder app name and bundle identifier I can change.

Tell me step by step how to build and install the development build on my phone.

You'll need to sign in to Expo and, for iPhone, your Apple Developer account. Builds run in Expo's cloud, so you don't need a Mac.


### Step 1.7 — Error reporting

Add Sentry to the app using the Expo Sentry integration. Read the DSN from an environment variable. Add a hidden test button in a debug menu that throws an error so I can confirm it reaches Sentry.


### Phase 1 exit check

- [ ] Sign up, sign in and sign out work on iPhone and Android
- [ ] Under-18 birth dates are blocked
- [ ] A test error shows up in Sentry
- [ ] No .env file or keys in the GitHub repository
- [ ] Committed and pushed: "Phase 1 complete"

## Phase 2 — Profiles and photos

Goal: a new user goes through onboarding, fills in a profile and uploads photos, and only screened photos can ever be seen by others.


### Step 2.1 — Profiles table

Read PLAN.md (Data model). Write a Supabase migration that creates the profiles table:

id (references auth.users), display_name, birthdate, pronouns, identities (text array), looking_for (text array), bio (max 500 chars), verified_at, last_active_at, hide_distance (default false), paused (default false), created_at, updated_at.

Turn on Row Level Security: a user can read and update only their own row. Other users get profile data only through server functions later.

Add a trigger that creates an empty profile row when a new auth user signs up.

Generate TypeScript types from the database.

Test: run the migration on your dev project (Codex will give the command), sign up a new account, and check in the Supabase dashboard that a profile row appeared.


### Step 2.2 — Onboarding screens

Build a multi-step onboarding flow shown after first sign-up:

1. Display name

2. Pronouns (common choices plus free text)

3. Identity tags, multi-select: lesbian, bisexual, pansexual, queer, gay, trans, nonbinary, genderqueer, asexual, questioning, plus free text

4. Looking for, multi-select: chat, friends, dates, relationship, hookups

5. Short bio (optional)

6. Photos (next step)

Show progress, allow going back, and save each step so leaving and returning resumes where they stopped.

Add a profile edit screen reachable from home that edits the same fields.


### Step 2.3 — Photo upload

Create a private Supabase storage bucket called photos and a photos table: id, profile_id, storage_path, position, moderation_status (pending, approved, rejected), is_private, created_at.

Let users pick up to 6 photos with expo-image-picker, crop to square, compress to under 1 MB, upload, and drag to reorder.

The first photo must show the user's face (say so in the UI).

Photos start as pending. Only the owner can see pending or rejected photos.

Other users get approved photos only through short-lived signed URLs from a server function.


### Step 2.4 — Automatic photo screening

Create a Supabase Edge Function that runs when a photo is uploaded. It sends the image to [AWS Rekognition / Hive — pick the one I signed up for] for nudity and violence detection.

Approve photos below a safe threshold, reject clear violations, and mark borderline ones as needs_review for a human.

Store the API key as a Supabase secret, never in the app.

Show the user the status of each photo and a short reason if rejected.

Test: upload a normal selfie (approved), then a clearly inappropriate test image from the vendor's sample set (rejected). Never use real explicit images of anyone for testing.


### Phase 2 exit check

- [ ] A new user can finish onboarding and lands on home with a complete profile
- [ ] Quitting mid-onboarding and reopening resumes the right step
- [ ] Photo upload, reorder and delete work
- [ ] Screening approves normal photos and rejects test violations
- [ ] Logged in as user B, you cannot read user A's pending photos or profile row directly (ask Codex to write a test that tries)
- [ ] Committed and pushed: "Phase 2 complete"

## Phase 3 — Location and the nearby grid

Goal: two phones see each other in a grid with a rounded distance, and nobody can work out where anyone actually is. This is the riskiest phase; take it slowly.


### Step 3.1 — Location storage

Write a migration that enables the PostGIS extension and creates a locations table: profile_id (primary key), point (geography), grid_cell (text), updated_at.

Row Level Security: no client can select from this table at all, not even their own row. Writes happen only through a server function.

Create a server function update_my_location(lat, lng) that:

- snaps the position to a grid of roughly 500 m cells before storing it (store the cell centre, never the raw point)
- rejects updates more often than once per minute per user
- overwrites the old row instead of keeping history

### Step 3.2 — Location permission in the app

Using expo-location, ask for foreground location only (never background).

Before the system prompt, show a screen explaining why we need location and that exact location is never shown to anyone.

If permission is denied, show the grid empty with a button to open settings.

Send location with update_my_location when the app opens and at most every 5 minutes while open.


### Step 3.3 — The nearby query

Create a server function get_nearby(filters) that returns up to 100 profiles for the calling user:

- within the chosen radius of the caller's stored cell
- excluding the caller, paused profiles, anyone either side has blocked, and profiles with no approved photo
- applying filters: age range, looking_for, online now (active in last 10 minutes), verified only
- sorted by distance, then by last active
- returning id, display name, age, first approved photo (signed URL), online flag, verified flag, and a distance LABEL only: "Nearby" under 1 km, then whole km up to 10, then "10+ km". Users with hide_distance get no label.
Never return coordinates or exact distances. Rate-limit to 30 calls per minute per user.


### Step 3.4 — Grid and profile screens

Build the home tab as a 3-column grid of square photo tiles with name, age, online dot, verified badge and distance label. Pull to refresh. Infinite scroll if more than 100.

Add a filter sheet for age, distance, looking for, online now and verified only, saved on the device.

Tapping a tile opens a full profile screen: photo carousel, all profile fields, Wave button and Message button (message does nothing yet).

Add a waves table and a Waves tab listing who waved at you.


### Step 3.5 — Privacy attack test

Write an automated test that tries to locate a user: create a target at a known spot, then call get_nearby from 20 fake positions around it and try to triangulate the target from the distance labels. Report how close the best guess gets.

If the guess is closer than 500 m, explain why and fix the server logic.


### Phase 3 exit check

- [ ] Two real phones in different places see each other with sensible labels
- [ ] Turning on hide distance removes the label
- [ ] Filters work, and paused profiles disappear from the grid
- [ ] The attack test cannot get closer than about 500 m
- [ ] No API response anywhere contains latitude or longitude (ask Codex to search the code for it)
- [ ] Committed and pushed: "Phase 3 complete"

## Phase 4 — Chat and notifications

Goal: two people can message in real time, send photos, and get a push notification when the app is closed.


### Step 4.1 — Chat tables

Write a migration for conversations (id, created_at), conversation_members (conversation_id, profile_id, last_read_at) and messages (id, conversation_id, sender_id, body max 2000 chars, media_path, created_at).

Row Level Security: only the two members can read or insert messages in a conversation.

Create a server function start_conversation(other_profile_id) that returns the existing conversation for that pair or creates one, and refuses if either person has blocked the other.

Turn on Supabase Realtime for the messages table.


### Step 4.2 — Chat screens

Build a Messages tab listing conversations: other person's photo, name, last message preview, time, unread dot. Newest first.

Build a chat screen: message bubbles, send box, live updates through Realtime, load older messages on scroll up, typing indicator and read receipts (based on last_read_at).

Wire the Message button on profiles to start_conversation.

Handle bad network: show sending / failed states and a retry button.

Test: two phones, send messages both ways, put one in airplane mode, send, turn it back on.


### Step 4.3 — Photos in chat

Let users send a photo in chat. Store it in a private chat-media bucket readable only by the two members.

Screen it with the same moderation function. Photos flagged as explicit are allowed in private chat but arrive blurred, with a "Tap to view" button, and a setting lets each user choose to always blur, or block explicit photos entirely.

Run moderation before the recipient can see the photo.


### Step 4.4 — Push notifications

Set up expo-notifications. Ask for notification permission after the user's first wave or message, not at launch.

Store each device's Expo push token in a push_tokens table.

Create a database trigger plus Edge Function that sends a push for new messages and waves to the recipient's devices, unless they are blocked or the conversation is open on screen.

Notification text says only "New message" or "Someone waved" by default, with a setting to show the sender's name. Never show message text on the lock screen by default.

Tapping a notification opens the right chat.


### Phase 4 exit check

- [ ] Messages arrive instantly on both phones, in both directions
- [ ] Offline messages send when the connection returns
- [ ] Chat photos work, and explicit ones arrive blurred
- [ ] Push arrives when the app is closed and opens the right chat
- [ ] A third account cannot read the conversation (ask Codex for a test)
- [ ] Committed and pushed: "Phase 4 complete"

## Phase 5 — Safety layer and admin dashboard

Goal: users can block and report, only verified people can message, and you can review reports and ban people from a dashboard.


### Step 5.1 — Block and report

Write migrations for blocks (blocker_id, blocked_id, created_at) and reports (id, reporter_id, reported_id, conversation_id optional, reason, details, status, reviewed_by, created_at).

Reasons: fake profile or man posing as a woman, harassment, nudity in public photos, appears underage, scam or spam, other.

Add Block and Report to the profile screen and chat screen menus. Reporting offers to block as well.

A block hides both people from each other everywhere: grid, waves, messages, push.

An "appears underage" report immediately pauses the reported profile until reviewed.

Add a Blocked users list in settings with unblock.


### Step 5.2 — Selfie verification

First, sign up with your verification vendor and get sandbox keys. Then:

Integrate [Persona / Veriff] selfie liveness verification using their React Native SDK, in sandbox mode.

Add a verifications table: profile_id, method, vendor_ref, status (pending, passed, failed, needs_review), reviewed_by, created_at.

The vendor result arrives at a Supabase Edge Function webhook; verify the webhook signature. Never trust a pass sent from the app.

On pass, set verified_at on the profile. On fail or unclear, mark needs_review.

Users must be verified before they can send a message or wave. Show a friendly gate explaining why.

Store vendor keys only as Supabase secrets.


### Step 5.3 — Admin dashboard

Create a separate Next.js web app in an admin/ folder of this repo, using Supabase auth.

Only accounts listed in an admins table can sign in.

Pages:

- Reports queue: newest first, filter by reason and status, see the reported profile, its photos, the report details, and that person's past reports
- Photo review: photos marked needs_review, approve or reject
- Verification review: needs_review cases, approve or reject
- User page: profile, status, ban or unban, with a reason
All admin actions go through server functions that check the admins table and write to an admin_actions audit log.


### Step 5.4 — Bans and account deletion

Add a bans table keyed by user id AND device id (store a device identifier at sign-in).

Banned users are signed out and cannot create a new account on the same device.

Add in-app Delete account in settings: confirms twice, deletes profile, photos, messages they sent, location, push tokens and the auth user, then signs out. Keep only what the law requires (for example the report record) and document it in PLAN.md.


### Step 5.5 — Security review

Review the whole project for security problems: Row Level Security on every table, functions that leak another user's data, secrets in the code, missing rate limits, anything returning coordinates. List every issue with a severity, then fix them one at a time.


### Phase 5 exit check

- [ ] Block hides both people everywhere, instantly
- [ ] A report shows up in the dashboard, and a ban signs the person out
- [ ] A banned person cannot sign up again on the same phone
- [ ] Unverified users cannot message; verified users can
- [ ] Delete account removes the user's data and they can't sign in
- [ ] Security review issues all fixed
- [ ] Committed and pushed: "Phase 5 complete"

## Phase 6 — Private beta in one city

Goal: real people in one city use the app for several weeks, and you learn what's broken and what they want, before strangers see it.


### Step 6.1 — Production setup

Set up the production environment: point production builds at the yourapp-prod Supabase project, apply all migrations there, set all secrets there, and switch verification and moderation vendors to live keys.

Add a simple script that applies migrations to prod so it's never done by hand.

Add a feature flag table so I can turn features on and off without a new app release.

You: turn on daily backups in the prod Supabase project, and add yourself as the first admin.


### Step 6.2 — Feedback and analytics

Add a "Send feedback" button in settings that saves a message plus app version and phone model to a feedback table, visible in the admin dashboard.

Add privacy-respecting analytics with PostHog: count events like signed_up, finished_onboarding, verified, opened_grid, sent_wave, sent_message. Never send identity tags, messages or location to analytics.

Add an invite code gate at sign-up so only invited testers get in during beta.


### Step 6.3 — Test builds

1. Ask Codex to build preview versions with EAS for both platforms.

2. iPhone: upload to TestFlight (Codex can walk you through eas submit). Add testers by email, or use a public TestFlight link with the invite code gate.

3. Android: create the app in Google Play Console, upload to the internal or closed testing track, and add testers.


### Step 6.4 — Recruit testers (you)

- Pick one city and aim for at least 50 to 100 testers before inviting more; an empty grid makes people quit.
- Recruit at queer bars, sports leagues, book clubs, community centers and Pride groups, and through friends of friends.
- Make a short sign-up form and a group chat or Discord for testers.
- Ask a few trusted testers to try to break things: fake profiles, spam, location tricks.

### Step 6.5 — The weekly beta loop

For 4 to 8 weeks, every week:

1. Read every feedback message and every report in the dashboard.

2. Check Sentry for crashes and PostHog for where people drop off (onboarding? verification?).

3. Pick the top 3 problems and fix them with Codex.

4. Ship a new beta build and tell testers what changed.


### Phase 6 exit check

- [ ] Testers come back on their own during the week, not just on day one
- [ ] Most new testers finish onboarding and verification
- [ ] No crash affects more than a small share of users
- [ ] Reports get reviewed within a day
- [ ] Committed and pushed: "Phase 6 complete"

## Phase 7 — Public launch

Goal: the app is live in both stores in your launch city, with legal pages in place and a way to make money.


### Step 7.1 — Legal and business (you, with a lawyer)

- [ ] Form an LLC or similar and open a business bank account
- [ ] Have a lawyer review or write the privacy policy and terms of service (see the legal checklist in PLAN.md)
- [ ] Set up a support email on your domain, for example support@yourapp.com
- [ ] Write community guidelines in plain words: who the app is for, what gets you banned

### Step 7.2 — Website

Create a simple website in a site/ folder: home page with what the app is and store links, privacy policy, terms, community guidelines, a support/contact page, and a page explaining how to delete your account and data.

Keep it static and fast. Tell me how to deploy it for free on my domain.


### Step 7.3 — Subscriptions

Integrate RevenueCat for a monthly and a yearly subscription (names and prices I'll set in App Store Connect and Google Play).

Paid features, controlled by a single is_premium check on the server: more profiles in the grid (300 instead of 100), incognito browsing, advanced filters, see who viewed your profile.

Never put safety features behind the paywall: block, report, verification, hide distance stay free.

Add a paywall screen, restore purchases, and a manage subscription link.

The server learns about purchases from RevenueCat webhooks, not from the app.


### Step 7.4 — Store listings (you)

1. App name, subtitle, description, keywords and screenshots (ask Codex to set up a way to take clean screenshots with fake demo profiles, never real users).

2. Age rating: answer the questionnaires honestly; expect 17+ on iOS and Mature on Google Play.

3. Privacy labels: Apple's "App Privacy" and Google's "Data safety" forms must match your privacy policy. List location, photos, sensitive info and identifiers.

4. Give reviewers a demo account with a pre-verified profile, and explain in the review notes how verification and moderation work.


### Step 7.5 — Release

Prepare the production release: remove the invite code gate behind a feature flag, bump the version, build production versions with EAS, and walk me through submitting to both stores.

Apple review can take a few days and dating apps often get questions. Answer them calmly and specifically; rejections are normal and fixable.


### Phase 7 exit check

- [ ] Approved and live in both stores
- [ ] Website, privacy policy and terms live and linked from the app
- [ ] A test purchase works and unlocks premium; restore works
- [ ] Committed, pushed and tagged in GitHub as v1.0.0

## Phase 8 — Version 1 features

Goal: add the version 1 features one at a time, in the order users ask for them. Each one is its own small project: build behind a feature flag, test with a few users, then turn it on for everyone.


### Step 8.1 — Right Now status

Add a "Right Now" toggle: the user picks 1, 2 or 4 hours and an optional short line ("Free for coffee downtown"). Their tile shows a badge until it expires. Add a Right Now filter to the grid. Expiry is enforced on the server. Behind feature flag right_now.


### Step 8.2 — Favorites

Add a favorites table and a star on profiles. Add a Favorites section at the top of the grid. Favoriting is private; the other person is never told.


### Step 8.3 — Private albums

Add private albums: a user can mark photos as private, then share the album with a specific person from chat. Sharing can be revoked at any time and access ends immediately. Shared photos are viewed in-app only, with signed URLs that expire in minutes. Show the owner a notice if the platform reports a screenshot where possible. Behind feature flag private_albums.


### Step 8.4 — Voice notes and live location

Add voice notes in chat (up to 60 seconds, stored in chat-media).

Add "Share my location" in chat: shares a live map pin for 15, 30 or 60 minutes, then stops automatically, and can be stopped early. This is the one place an exact location is shown, only by explicit choice, only to one person, and never stored after it expires.


### Step 8.5 — Safety check-in

Add a date safety check-in: the user enters who they're meeting (links the profile), where, when, and a trusted contact's phone number. At the end time the app asks "Are you OK?". If they don't respond within 30 minutes, the contact gets a text message with the details. Use a texting service (for example Twilio) through an Edge Function. Make clear in the UI this does not contact emergency services.


### Step 8.6 — Explore mode (premium)

Add Explore mode for premium users: pick a city on a map and browse its grid as if there. Profiles see "Visiting from elsewhere" on explorers. Distance labels in explore mode show only the city, never distance.


### Phase 8 exit check (per feature)

- [ ] Built behind a flag and tested on two phones
- [ ] Turned on for a small group first, then everyone
- [ ] No new crashes in Sentry after a week
- [ ] PLAN.md updated to show it's done

## After launch: running the app

Once live, most of the work is operations, not code. Set a rhythm and keep it.


### Every day

- [ ] Clear the reports queue, "appears underage" reports first
- [ ] Review photos and verifications marked needs_review
- [ ] Glance at Sentry for new crashes

### Every week

- [ ] Read all feedback and app store reviews; reply to store reviews
- [ ] Check sign-ups, verification completion, daily active users and messages sent in PostHog
- [ ] Pick the top 3 problems or requests and plan the week's work with Codex
- [ ] Ship an update if anything is ready

### Every month

- [ ] Update dependencies and the Expo SDK (ask Codex: "Update dependencies safely, one at a time, and run the app after each")
- [ ] Re-run the Phase 3 location attack test and the Phase 5 security review
- [ ] Test restoring the database from a backup into the dev project
- [ ] Review costs on Supabase, vendors and EAS

### Growing to a new city

Only open a new city once the first one feels busy. Repeat the Phase 6 playbook there: recruit locally, run a short invite-only period, then open it up.


### When you need help

By the time you have thousands of users, reports alone will be more than one person can handle. Plan for a part-time moderator before that, ideally someone from the community.


## When things go wrong

| Problem | What to do |
| --- | --- |
| Codex keeps "fixing" the same error without success | Commit what works, start a new Codex chat, paste the full error and the file it points to, and ask it to explain the cause before changing anything. |
| Codex changed files you didn't expect | In GitHub Desktop, right-click the file and choose Discard changes, then ask Codex to redo the step without touching that file. |
| Everything is broken and you don't know why | In GitHub Desktop, discard all changes to go back to your last commit. This is why you commit after every working step. |
| A real key or .env got committed | Rotate (regenerate) that key in the service's dashboard right away; deleting it from git is not enough. |
| App works in development, crashes in a test build | Check Sentry for the error, then give it to Codex. Often a missing environment variable in the EAS build profile. |
| "Permission denied" or empty data from Supabase | Usually a Row Level Security rule. Ask Codex to show the rule for that table and explain who it allows. |
| Push notifications don't arrive | Confirm you're on a development or production build (not Expo Go), that notification permission is on, and that a push token row exists for the device. |
| The app store rejects you | Read the exact guideline they cite, fix only that, and reply in the review notes explaining what changed. |
| Codex suggests sending coordinates to the app "to make it easier" | Say no. Exact locations stay on the server; see Phase 3. |

