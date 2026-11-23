# Urban Stories

Next.js App Router frontend with Sanity CMS and an embedded Sanity Studio.

## Sanity project

- Project ID: `mzzvg4lh`
- Dataset: `production`
- Studio route: `/studio`
- Local environment variables are in `.env.local` (do not commit secrets).

## Local development

```bash
npm install
npm run dev
```

## Sanity Studio schema deployment

The Studio schema source is in `sanity.config.ts` and `src/sanity/schemaTypes/`.
Authenticate the Sanity CLI, then deploy the workspace schema:

```bash
npx sanity login
npx sanity schema deploy --workspace urban-stories
```

## CMS singleton documents

After schema deployment, create the singleton documents with these exact IDs from Studio:

- `siteSettings`
- `homePage`
- `mainNavigation`
- `siteFooter`

Populate them before publishing articles. Create categories and authors first, then reference them from articles. Set article/page editorial status to `published` and set a publication date to make them visible on the website.

## Revalidation

Configure `SANITY_REVALIDATE_SECRET` in the deployment environment and create a Sanity webhook targeting `POST /api/revalidate` with the `x-sanity-secret` header. The endpoint revalidates tagged content after Sanity mutations.

## Content routes

- `/article/[slug]`
- `/category/[category]`
- `/author/[slug]`
- `/pages/[slug]`
- `/search?q=...`
- `/studio`

The legacy `/articles/[slug]` route redirects to `/article/[slug]`.
