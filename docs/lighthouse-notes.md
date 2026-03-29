# Lighthouse Notes

## How to run

1. Start the application in production mode.
2. Run Lighthouse against the homepage and one prompt detail page.
3. Save the generated report or screenshot with the final submission.

Suggested command:

```bash
npx lighthouse http://localhost:3000 --view
```

## Review points

- Performance
  - keep large shadows and blurred backgrounds under control
  - verify image optimization on remote avatars and future public media
- Accessibility
  - confirm contrast in light and dark theme
  - confirm form fields have accessible labels or `aria-label`
- Best Practices
  - confirm analytics load only after consent
  - confirm no console errors in production mode
- SEO
  - confirm metadata title and description
  - confirm canonical URLs
  - confirm `robots.txt` and `sitemap.xml`

## Current project notes

- Metadata is generated for the public detail route.
- `NEXT_PUBLIC_APP_URL` must be set for correct canonical and sitemap URLs.
- Analytics are gated by cookie consent.
- Public pagination, search and tag filters are indexable URL states.
