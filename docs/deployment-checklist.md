# Deployment Checklist

## Target

- Deploy the app to Vercel.
- Use PostgreSQL in production.

## Required environment variables

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `DEFAULT_ADMIN_ID` if admin bootstrap is needed

## Deployment steps

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Configure all production environment variables.
4. Run database migrations with `npx prisma migrate deploy`.
5. Seed only if the production environment should include demo data.
6. Verify public routes, dashboard login and API ownership checks.
7. Confirm that `NEXT_PUBLIC_APP_URL` matches the final production domain.

## Analytics

1. Create a Google Analytics 4 property.
2. Copy the GA measurement ID into `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
3. Open the deployed app.
4. Accept analytics cookies in the consent banner.
5. Verify incoming pageviews in GA realtime view.

## Search Console

1. Add the deployed domain to Google Search Console.
2. Verify ownership of the domain.
3. Submit `https://your-domain/sitemap.xml`.
4. Monitor indexing and coverage issues.

## Bing Webmaster Tools

1. Add the deployed domain to Bing Webmaster Tools.
2. Verify ownership.
3. Submit `https://your-domain/sitemap.xml`.
4. Check crawl and indexing reports.

## Final verification

- public homepage loads
- prompt detail pages load
- dashboard requires login
- ownership checks work
- analytics load only after consent
- `robots.txt` and `sitemap.xml` are available
