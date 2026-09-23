# Supabase setup

This guide creates a reproducible development database for SabKhooneh.

## Requirements

- A Supabase project or local Supabase CLI installation
- Node.js 22 or newer
- A separate development project that contains no real household data

## Create the schema

Run `supabase/migrations/0001_initial_schema.sql` in the Supabase SQL editor. For local development, you may then run `supabase/seed.sql` to add two fictional accounts and one demo room.

The migration creates the canonical tables used by the application:

- `rooms`
- `users`
- `whitelists`
- `announcements`
- `cartable_requests`
- `chores_history`

It also adds foreign keys, validation constraints, useful indexes, and enables Row Level Security on every table.

## Configure the application

Copy `.env.example` to `.env.local`, then provide the project URL and browser-safe anonymous key:

```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

Never place the service-role key in a browser environment or commit it to Git.

## Security status

The initial migration intentionally creates no permissive RLS policies. This means a public anonymous client cannot read or write household records immediately after applying it. That secure default prevents accidental exposure while the authenticated room-membership policies are being implemented.

The fixed development OTP shortcut has been removed and application queries now attach `room_id`. Production deployment still requires authenticated RLS policies and a verified signup-provisioning flow. Before production use:

1. Require a verified Supabase Auth session before provisioning every member profile.
2. Add RLS policies that restrict rows to the authenticated member's room.
3. Verify Mayor-only operations at the database layer.
4. Test cross-room access with separate accounts.

These tasks are security requirements, not optional deployment enhancements.

## Local verification

After applying the migration, confirm in the Supabase Table Editor that all six tables exist and RLS is enabled. If you apply the optional seed file through an administrative SQL session, confirm the `DEMO01` room contains only the two fictional example users.

Application checks remain:

```bash
npm run lint
npm test
npm run build
```
