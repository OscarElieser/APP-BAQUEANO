# BAQUEANO WEBSITE

## Why

This workspace is the independent web layer for Baqueano Nicaragua. It exists to serve the public website, the administration console, and shared web contracts without changing the existing Flutter Android application.

## How

The architecture is a pnpm monorepo contained only inside `website/`:

- `apps/web`: public exploration experience.
- `apps/admin`: Baqueano Control Center.
- `packages/ui`: reusable React UI primitives.
- `packages/design-system`: official colors, spacing, motion, and typography tokens.
- `packages/types`: Firestore-compatible TypeScript contracts shared by web and admin.
- `packages/validators`: Zod schemas for defensive validation.
- `packages/firebase`: client Firebase initialization and collection helpers.
- `packages/config`: route, role, and environment configuration.

## What

The workspace provides a Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Firebase, and Zod foundation for a cinematic, accessible, responsive Baqueano web ecosystem.

## Mobile App Shield

ESTA PROHIBIDO MODIFICAR:

- `/lib`
- `/android`
- `/test`
- `pubspec.yaml`

All communication between Android, Website, and Admin must happen through Firestore, APIs, or compatible data contracts. Do not duplicate production records manually across platforms.

## Local Commands

```bash
pnpm install
pnpm dev:web
pnpm dev:admin
pnpm typecheck
pnpm lint
```

## Environment

Create app-specific `.env.local` files from `.env.example` in each app. Never commit secrets. Firebase client variables must be public browser-safe keys only; server credentials must stay out of client bundles.
