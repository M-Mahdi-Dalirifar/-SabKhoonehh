# SabKhooneh Roadmap

This roadmap lists practical areas for improving SabKhooneh. Items are not guaranteed release commitments and may change as the project develops.

## Near term

- Add automated tests for chore rotation and role-based flows
- Implement and test authenticated, room-scoped Supabase Row Level Security policies
- Remove the development OTP shortcut before production use
- Improve accessibility for keyboard and screen-reader users
- Add loading, empty, and error states across synchronized views
- Reduce use of broad `any` types in data mapping code
- Document deployment steps

## Product improvements

- Room invitation and onboarding flow
- Better chore scheduling controls
- Configurable recurring tasks
- Notification preferences
- Improved vacation and temporary absence handling
- Household activity filters and history search

## Reliability

- Define synchronization conflict behavior
- Add retry and backoff for network failures
- Add integration tests for Supabase flows
- Add CI checks for type errors and production builds

## Contributor experience

- Keep the reproducible database migration and fictional seed data aligned with application changes
- Add Issue labels for bugs, features, documentation, and good first issues
- Add contributor-focused starter tasks

If you want to work on a roadmap item, open or comment on an Issue before starting a large change.
