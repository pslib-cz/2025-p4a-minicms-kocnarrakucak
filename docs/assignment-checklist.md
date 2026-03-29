# Assignment Checklist

This document tracks the school assignment requirements for the custom mini CMS project.

Last reviewed: 2026-03-24

## Product framing

- Build a full publishing web application that demonstrates Next.js App Router capabilities.
- The application must contain a public site, an internal dashboard, and custom API routes.
- Each user can manage only their own content.
- In this project, the main content entity is `Prompt`.

## Requirement status

### Data model

- [x] Prisma ORM is used.
- [x] `User -> Prompt` provides a 1:N relation.
- [x] `Prompt <-> Tag` provides an N:M relation.
- [x] Main content includes `title`, `slug`, `description`, `createdAt`, `updatedAt`, and `publishDate`.
- [x] Additional categorization entities exist: `Tag`, `PromptType`, `AiModel`, `ModelEvaluation`.
- [ ] Local SQLite setup is not configured in the repository. The current Prisma datasource is PostgreSQL-only.

### Authentication and identity

- [x] Authentication is implemented with Auth.js / NextAuth.
- [x] Only signed-in users can access the dashboard.
- [x] Users can read and modify only their own prompts in the dashboard and API.
- [x] API routes verify the session server-side.

### Public site

- [x] Public list of published content exists.
- [x] Public detail page exists and uses dynamic routes.
- [x] Search by title / text exists.
- [x] Tag-based filtering exists.
- [ ] Public pagination is not implemented.
- [x] Public pages are implemented as Server Components.

### SEO

- [x] Dynamic metadata is generated from content.
- [x] OpenGraph metadata is generated from content.
- [x] Canonical URL is generated.
- [x] `sitemap.xml` exists.
- [x] `robots.txt` exists.
- [ ] Production base URL still needs to be configured through environment variables instead of the placeholder fallback.

### Dashboard

- [x] Dashboard is protected and implemented with Client Components.
- [x] Dashboard communicates with the backend through Route Handlers.
- [x] A supported UI library is used (`@nextui-org/react`).
- [x] Users can list their own prompts.
- [x] Users can create prompts.
- [x] Users can edit prompts.
- [x] Users can delete prompts.
- [x] Users can switch prompt status between draft and published.
- [x] Tag / categorization management exists.
- [x] Server-side validation exists for the main entity.
- [ ] Dashboard pagination is not implemented.
- [~] A markdown editor is used for prompt content. Confirm whether this is acceptable as the required editor experience for the assignment.

### API

- [x] CRUD exists for the main entity (`Prompt`).
- [x] Authentication checks are present.
- [x] Ownership checks are present.
- [x] Server-side validation is present.

### Required Next.js features

- [x] Dynamic routes are used.
- [x] Metadata generated from content is used.
- [ ] `revalidate` / ISR is not implemented.
- [ ] `next/image` optimization is not used in the current UI.
- [ ] Server Actions are not used.

### Analytics and consent

- [ ] No analytics integration is present yet.
- [ ] No cookie consent flow is present yet.
- [ ] The app has not been verified for analytics-disabled operation because analytics are not integrated yet.

### Lighthouse and SEO review

- [ ] No Lighthouse audit notes or screenshots are stored in the repository.

### Deployment and post-deployment setup

- [ ] Deployment target is not documented in the repository.
- [ ] Google Search Console setup is not documented.
- [ ] Bing Webmaster Tools setup is not documented.

### Repository requirements

- [ ] Prisma migrations are missing from the repository.
- [x] Seed script with demo data exists.
- [x] `.env.example` is present.
- [ ] `README.md` is still the default template and does not document the application properly yet.

## Notes for ongoing work

- The project already exceeds the minimum scope by supporting prompt types, model evaluations, and role-based admin screens.
- The main remaining gaps against the assignment are pagination, analytics + consent, deployment/documentation work, and a proper README.
- Frontend redesign should preserve the required split between public Server Components and dashboard Client Components.
