# Strapper

A mobile app for queer women and nonbinary people, including trans women.
Working name: Strapper. Expo SDK 57 matches Expo Go 57.0.9.

Phase 1 code now includes email code sign-up/sign-in, the 18+ signup gate,
protected screens, native secure session persistence, sign-out, EAS build profiles,
and optional Sentry reporting. Real-device auth, native builds, and Sentry delivery
still need their exit checks. The development Auth API is reachable. The server age-gate migration was applied through the development dashboard on October 17, 2026; its trigger is enabled.

## Run on your phone

Use Node.js 24 LTS and npm. From the repository folder:

```powershell
npm install
npm start -- --clear
```

Scan the new terminal QR code with your phone on the same Wi-Fi. The default
start command explicitly targets Expo Go, even though a development client is
now installed in the project. You should see **Your people. Your space.** with
Create account and Sign in buttons. If Wi-Fi fails, use `npm start -- --tunnel`.
For web preview use `npm run web`. Local iOS simulators require macOS; a physical
iPhone works from Windows.

Keep your existing `.env`. Do not overwrite it with the empty example.
It needs the dev project's API URL (`https://YOUR_PROJECT_REF.supabase.co`, not
its dashboard page URL) and public publishable/anon key. Server secret keys,
service-role keys, and database passwords never belong in the mobile app.
`git check-ignore .env` must print `.env`.

## Supabase setup needed before auth testing

In **strapper-dev only**:

1. Configure custom SMTP first (or use a plan that allows template editing). The hosted dashboard currently disables template edits with its default email service. Resend setup is pending a sender domain. Open Authentication → Email Templates. Set both **Confirm signup** and
   **Magic link** to include the six-digit token. For example:
   `<p>Your Strapper sign-in code is <strong>{{ .Token }}</strong></p>`.
   Remove the default sign-in link so testers use the app's code field.
2. In the Email provider settings, set email OTP length to **6**. Keep email
   confirmation enabled. The local CLI config already uses six-digit codes;
   it does not change your hosted project's settings automatically.
3. Already applied to strapper-dev on October 17, 2026; the trigger was verified enabled. For reference, apply `supabase/migrations/20261018000000_require_adult_signup.sql` using
   the SQL Editor. Alternatively link the CLI to the dev project and use
   `npx supabase db push --dry-run`, followed by `npx supabase db push`.
   See `supabase/README.md` for migration-history details if using the SQL Editor.

Supabase's default email sender may restrict recipients to your organization
members and rate-limit sends. Use your Supabase account's email for the first test;
configure custom SMTP before inviting other testers. See the official
[SMTP guidance](https://supabase.com/docs/guides/auth/auth-smtp).

The server trigger rejects invalid, missing, and under-18 birth dates on signup.
This is a declaration gate, not identity verification. It is **not active remotely
until the migration is applied**. Existing accounts are unchanged.

## Auth phone check

### Local email testing (domain deferred)

Local Supabase captures email in a test inbox; it does not send real email.
Start Docker Desktop and wait for its Linux engine to run, then:

```powershell
npx supabase start
powershell -File scripts/start-local.ps1 -Web
```

The first start downloads containers and applies local migrations, including the
adult signup gate. Open http://127.0.0.1:54324 on your computer to read the
six-digit signup and sign-in codes. Local email confirmation is enabled and both
email templates contain the code. Use fictional test data only.

For Expo Go on a physical phone, find your computer's Wi-Fi IPv4 address using
`ipconfig`, connect both devices to the same trusted Wi-Fi, and run:

```powershell
powershell -File scripts/start-local.ps1 -ApiHost YOUR_COMPUTER_WIFI_IPV4
```

The phone cannot reach your computer using `127.0.0.1`. Its local API URL must
use your computer's Wi-Fi address. Expo's tunnel does not tunnel Supabase.
The launcher reads only the local public key into Expo's process environment;
it preserves the hosted `.env`. Stop Expo before switching environments.
Local accounts are separate from hosted accounts. Use `npx supabase stop` when
finished; avoid `db reset` unless you intend to erase local test data.

The local launcher uses Expo port 8082 to avoid an existing hosted dev server.
An optional repeatable backend check is `node scripts/check-local-auth.mjs`.
It creates fictional local accounts and leaves their emails in the test inbox.
On October 17, 2026, this check passed signup/code delivery, invalid-code
rejection, verification, sign-out, repeat sign-in, and server rejection of
missing, invalid, and under-18 birth dates. Real-device UI testing is pending.

Hosted SMTP, the domain, real email delivery, and the remaining Phase 1 device,
development-build, and Sentry checks are still pending. Do not mark Phase 1
complete based on local testing alone.

1. Try Create account with a birth date under 18: sending must be blocked.
2. Enter your email and an adult birth date as YYYY-MM-DD. Send the code.
3. Enter an incorrect code first, then the newest valid six-digit code. Errors
   should be clear and retryable. Resend has a 60-second cooldown.
4. Confirm the signed-in home appears. Fully close and reopen the app: the native
   session should persist. Sign out, then sign in again with your email.
5. Test on both iPhone and Android. Check a bad network and recovery.

Signed-out users cannot open member screens through app navigation or deep links.
Sign-in never silently creates a new account. Verification email and birth date
stay in memory while requesting a code; restarting that flow starts again.
Native sessions are split into small encrypted SecureStore items and atomically
replaced. Failed writes preserve the prior session and never fall back to plaintext.
Web preview sessions use memory and are lost on refresh.

## Development builds (Step 1.6)

`eas.json` has development, preview, and production profiles.
`app.config.ts` gives development and preview separate names, schemes, and app IDs.
Replace `com.example.strapper` via `APP_BUNDLE_IDENTIFIER` before creating builds.
Do not build against production until the runbook's production setup phase.

1. Sign in and link this repository to your Expo account:

```powershell
npx eas-cli@latest login
npx eas-cli@latest init
```

2. In the EAS dashboard, configure the **development** environment with the same
   public Supabase URL/key as local dev and your chosen APP_BUNDLE_IDENTIFIER.
   Set preview values separately. Environment files ignored by git are not a
   replacement for EAS environment configuration.
3. Build and install:

```powershell
npx eas-cli@latest build --profile development --platform android
npx eas-cli@latest device:create
npx eas-cli@latest build --profile development --platform ios
```

Android: open the build link on the device and install the APK.
iPhone: register the device, complete Apple Developer authentication/signing in
EAS, then open the build link in Safari and install. Enable iOS Developer Mode
if prompted. Cloud builds work from Windows; installing a signed build on a
physical iPhone requires your Apple Developer membership.

Once installed, run `npm run start:dev -- --clear` and scan that server's QR code
with your development app. Native plugin changes require rebuilding that app.

## Sentry (Step 1.7)

Create a React Native project at [Sentry](https://sentry.io). Add
`EXPO_PUBLIC_SENTRY_DSN` to local `.env` and the EAS development environment.
For build source maps, also set SENTRY_ORG, SENTRY_PROJECT, and the secret
SENTRY_AUTH_TOKEN in EAS. Never use an EXPO_PUBLIC prefix for the auth token.
The Sentry native plugin is enabled when organization and project are configured;
Metro integration and the JS SDK are already installed.

Restart Expo. On signed-in home, hold **Development build · hold for tools** for
1.5 seconds to open the debug menu, then send a test error. Confirm it appears
in Sentry Issues. The button throws and captures a fixed test exception. The debug
route is unavailable in release builds. Native crash checks require a development
build; Expo Go only exercises the JS reporting path.

Reporting is off without a DSN. Identity, email, birth date, tokens, requests,
console breadcrumbs, raw error messages, replay, and performance traces are
excluded from events. Error types and stack locations remain for diagnostics.

## Checks

```powershell
npm test
npm run typecheck
npm run lint
npm run format:check
npx expo-doctor
npx expo export --platform all --max-workers 2
```

Use `npm run format` for formatting. Age tests cover the exact 18th birthday,
invalid calendar dates, future dates, and leap days. Secure-storage tests cover
large Unicode sessions, interrupted writes, replacement, deletion, and missing chunks.
The server migration needs validation against your dev database; Docker is not
running locally. No real signup email has been sent by Codex.

## Layout and status

- `app/(auth)/`: welcome, email forms, and code verification.
- `app/(member)/`: protected signed-in home and development tools.
- `src/components/`: auth context and shared UI.
- `src/hooks/`: foreground auth refresh lifecycle.
- `src/lib/`: Supabase, secure storage, age validation, and Sentry.
- `supabase/`: local config and migrations.
- `PLAN.md`, `RUNBOOK.md`: requirements and manual exit checks.

Phase 2 starts after the Phase 1 phone, Sentry, and development-build checks pass.
Changes are not committed or pushed. Production has not been modified.

## Dependency audit

The current install reports 30 dependency vulnerabilities (19 high, 11 moderate),
including Expo/Metro transitive dependencies. Previous compatible fixes were
applied. Avoid `npm audit fix --force` without reviewing SDK compatibility;
its suggestions include incompatible SDK downgrades. Recheck `npm audit` before beta.
