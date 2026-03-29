# PromptVault

PromptVault is a mini CMS built with Next.js App Router for publishing AI prompts.

The project includes:

- a public prompt library built with Server Components
- an internal dashboard built with Client Components
- custom Route Handlers for CRUD operations
- Auth.js authentication with Discord
- Prisma ORM with PostgreSQL

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- NextUI
- Auth.js / NextAuth
- Prisma ORM
- PostgreSQL

## Main entities

- `User`
- `Prompt`
- `PromptType`
- `Tag`
- `AiModel`
- `ModelEvaluation`
- `Account`
- `Session`

### Key relations

- `User -> Prompt` is a 1:N relation
- `Prompt <-> Tag` is an N:M relation
- `Prompt -> PromptType` is an N:1 relation
- `Prompt -> ModelEvaluation` is a 1:N relation

## Features

### Public site

- published prompt listing
- prompt detail pages with dynamic routes
- search by title, description and prompt body
- tag filtering
- public pagination
- dynamic metadata, OpenGraph metadata and canonical URLs
- `sitemap.xml`
- `robots.txt`

### Dashboard

- protected creator workspace
- prompt listing with pagination
- create, edit and delete prompts
- draft / published status management
- prompt type, tag and AI model management
- markdown prompt editor
- evaluation management

### API

- prompt CRUD through Route Handlers
- session verification on the server
- ownership checks for user content
- server-side validation with Zod

### Additional assignment items

- cookie consent flow
- Google Analytics integration behind explicit consent
- Prisma migrations
- seed script with demo data
- deployment and Lighthouse notes in `docs/`

## Environment variables

Copy `.env.example` to `.env.local` and fill the values:

```bash
cp .env.example .env.local
```

Required variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`

Recommended variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `DEFAULT_ADMIN_ID`

Notes:

- If your database password contains special characters, URL-encode them in `DATABASE_URL`.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` enables Google Analytics pageview tracking only after cookie consent is accepted.

## Running locally

Install dependencies:

```bash
npm install
```

Apply migrations:

```bash
npx prisma migrate deploy
```

Seed demo data:

```bash
npm run seed
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Prisma workflow

Generate Prisma client:

```bash
npx prisma generate
```

Create a new migration after schema changes:

```bash
npx prisma migrate dev --name your_migration_name
```

Deploy migrations in production:

```bash
npx prisma migrate deploy
```

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test`
- `npm run seed`

## Deployment

Deployment and post-deployment notes are in:

- [docs/deployment-checklist.md](docs/deployment-checklist.md)
- [docs/lighthouse-notes.md](docs/lighthouse-notes.md)

Recommended production target: Vercel with PostgreSQL.

## Notes

- The public site remains server-rendered.
- The dashboard remains client-driven and talks to the backend through Route Handlers.
- Cookie consent blocks analytics until the user explicitly accepts it.
