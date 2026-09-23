# SabKhooneh

SabKhooneh is a mobile-first web application for managing shared-home chores, responsibilities, announcements, and rotating duties. It is designed for roommates, student housing, and shared apartments where recurring tasks need clear ownership.

## What it does

SabKhooneh helps a shared household coordinate recurring work through separate Citizen and Mayor views.

Current capabilities include:

- Room-based membership and role-aware dashboards
- Rotating chore assignments
- Garbage and vacuuming schedules
- Household announcements
- Requests and approval flows
- Activity history
- Vacation and skip-day flows
- Local fallback state for offline-friendly development
- Supabase-backed synchronization
- Gemini-powered AI features
- Responsive, mobile-first UI

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Google Gemini API
- Motion

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- A Supabase project
- A Gemini API key for AI features

### Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Copy the environment template:

```bash
cp .env.example .env.local
```

4. Fill in the required environment variables in `.env.local`.
5. Start the development server:

```bash
npm run dev
```

The app runs on port 3000 by default.

## Available scripts

```bash
npm run dev      # Start the local development server
npm run build    # Build for production
npm run preview  # Preview the production build
npm run lint     # Run TypeScript checks
```

## Project structure

```text
src/
  components/    UI and dashboard components
  lib/           External service integrations
  App.tsx        Main application state and routing
  main.tsx       Application entry point
  types.ts       Shared application types
```

Supporting Firebase and Supabase-related configuration files are kept in the repository root.

## Data and synchronization

SabKhooneh stores local fallback state in the browser and synchronizes supported room data with Supabase. The current application periodically refreshes shared data so multiple household members see recent changes.

Do not commit real API keys, service credentials, or production secrets. Use `.env.local` for local credentials and keep `.env.example` limited to safe placeholders.

## Contributing

Contributions are welcome. Start with `CONTRIBUTING.md`, then check open Issues for work marked as suitable for contributors.

If you want to propose a larger change, open an Issue first so the approach can be discussed before implementation.

## Roadmap

See `ROADMAP.md` for planned work. Near-term priorities include test coverage, accessibility, stronger authentication boundaries, improved synchronization behavior, and deployment documentation.

## Security

Please do not report security issues through public Issues. See `SECURITY.md` for the reporting process.

## License

This project is prepared for release under the MIT License. Review `LICENSE` before publishing or distributing the repository as open source.

## Maintainer

Maintained by Mohammad Mahdi Dalirifar.
