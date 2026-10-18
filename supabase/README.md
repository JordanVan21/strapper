# Supabase

Migrations live in `migrations/`. The CLI is installed as a development dependency;
`config.toml` describes the local development stack. No remote project is linked.

After creating your dev project, use these commands from the repository root:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_DEV_PROJECT_REF
npx supabase migration new descriptive_change_name
```

Write schema changes in the generated migration and review them before applying:

```powershell
npx supabase db push --dry-run
npx supabase db push
```

Use the development project reference only. The current migration adds a
server age gate to new Auth signups. CLI login credentials and database passwords are separate from the
public mobile app key. Never commit them. Local `supabase start` additionally
requires Docker; a hosted development project does not.

If your CLI account cannot access strapper-dev, use its dashboard SQL Editor to
run `migrations/20261018000000_require_adult_signup.sql` once. This is a development
setup step; do not run it in other projects. When linking the CLI later, reconcile
its migration history with `npx supabase migration repair 20261018000000 --status applied`
only after confirming that this migration was run successfully in that linked project.

The trigger requires a declared valid birth date in signup metadata, blocks
under-18 dates, and affects all new account creation paths (including dashboard
invites without birth-date metadata). It does not verify identity or alter any
existing accounts. The profile and its immutable birth date are Phase 2 work.
