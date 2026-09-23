# Contributing to SabKhooneh

Thanks for helping improve SabKhooneh.

## Before you start

- Search existing Issues before opening a new one.
- For larger changes, open an Issue first and describe the problem and proposed approach.
- Keep pull requests focused on one problem.
- Never commit credentials, production data, or private household information.

## Local development

1. Fork or clone the repository.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add your own development credentials.
5. Start the app with `npm run dev`.

Before opening a pull request, run:

```bash
npm run lint
npm run build
```

## Branch naming

Use short descriptive names such as:

- `feat/room-invitations`
- `fix/chore-rotation`
- `docs/setup-guide`
- `test/login-flow`

## Commit messages

Use clear, action-oriented commit messages. Examples:

- `feat: add room invitation flow`
- `fix: preserve chore turn after refresh`
- `docs: explain Supabase setup`

## Pull requests

A good pull request should include:

- What changed
- Why the change is needed
- How it was tested
- Screenshots for visible UI changes
- Any migration or configuration steps

## Issues

Bug reports should include reproduction steps, expected behavior, actual behavior, browser or device details, and screenshots or logs when useful.

Feature requests should explain the user problem first, then the proposed solution.

## Code quality

- Prefer typed TypeScript over `any` where practical.
- Keep UI components focused.
- Reuse shared types and service functions.
- Add tests when changing core scheduling, authentication, or synchronization behavior.
- Keep user-facing Persian text clear and consistent.

## Security

Do not disclose security vulnerabilities in public Issues. Follow `SECURITY.md`.
