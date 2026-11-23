# Urban Stories implementation status

Audit basis: `Urban Stories – Community, Contributor Portal, Authentication & Editorial Administration` (604-line project specification), repository branch `chore/bootstrap-urban-stories-app`.

Statuses are evidence-based. A page existing is not treated as proof that its full workflow works.

## Completed

| Requirement | Previous status | Work performed / implementation evidence | Integration | Validation | Final status |
|---|---|---|---|---|---|
| Public editorial website: homepage, article/category/author/search pages | Completed | Existing routes and CMS components retained; current Sanity dataset contains published articles and category documents. | Next.js, Sanity | Existing preview deployment is READY; public dataset query returned 4 published articles and 3 categories. | Completed (existing implementation; no changes) |
| Clerk sign-in/sign-up and session provider | Partially completed | Existing Clerk provider, sign-in and sign-up routes retained. | Clerk | Development instance configuration inspected; Google, email verification and password auth enabled. | Partially Completed (see gaps) |
| Server-side role resolution helper | Partially completed | `src/lib/auth/roles.ts` checks Clerk session, admin ID allowlist, private contributor role and suspension flag. | Clerk private metadata / Vercel env | Static source inspection. | Partially Completed (admin provisioning value not confirmed) |
| Sanity read/write client separation | Completed | `src/lib/sanity/client.ts` and server-only `src/lib/sanity/write-client.ts`; write token is read only server-side. | Sanity | Static source inspection; development dataset query succeeded. | Completed |

## Partially Completed

| Requirement | Previous status | Work performed / gap identified | Files / integration | Testing performed | Final status |
|---|---|---|---|---|---|
| Reader comments | Partially completed | GET/POST and owner PATCH/DELETE endpoints plus comment UI exist. Full abuse controls and end-to-end sign-in return flow still require verification. | `src/components/community/comments.tsx`; `src/app/api/community/comments/**`; Clerk + Sanity | Static review only; no authenticated browser journey run. | Partially Completed |
| Contributor application | Partially completed | Application form and POST endpoint exist; application records and email triggers are present. Status display and full application email delivery depend on admin provisioning and verified Resend sender domain. | `src/app/contributor/apply/page.tsx`; `src/components/community/contributor-application-form.tsx`; API; Sanity + Resend | Static review only. | Partially Completed |
| Contributor dashboard | Partially completed | Protected dashboard and contributor article listing exist. Editing and deleting an existing article were missing; added owner/admin-checked PATCH and DELETE route. | `src/app/contributor/dashboard/page.tsx`; new `src/app/api/contributor/articles/[id]/route.ts`; Sanity | TypeScript and production build pass. | Partially Completed |
| Article editor | Partially completed | Existing plain-text editor saved new documents only. Added persisted article ID handling, edit/update endpoint and debounced draft autosave; editor still lacks Portable Text rich formatting, featured-image upload, alt/caption fields and live preview. | `src/components/community/article-editor.tsx`; `src/app/api/community/articles/route.ts`; new dynamic API route; Sanity | TypeScript and production build pass. | Partially Completed |
| Admin dashboard and editorial review | Partially completed | Admin page, review panel and review API exist. Full publish/reject/request-changes lifecycle and all admin actions require authenticated owner testing. | `src/app/admin/page.tsx`; `src/components/community/admin-review-panel.tsx`; `src/app/api/admin/reviews/route.ts`; Clerk + Sanity | Static review only. | Partially Completed |
| Sanity schemas and editorial workflow fields | Partially completed | Local Studio schema source exists and dataset has article, author, category and siteSettings documents. Deployed schema lookup returned no registered schema; schema deployment not yet verified. | `sanity.config.ts`; `src/sanity/schemaTypes/**`; Sanity development dataset | GROQ read query succeeded; schema API lookup returned no deployed schema. | Partially Completed |
| Resend notification system | Partially completed | Shared email utilities/templates and event calls exist. No Resend sending domain is registered, so actual delivery is not verifiable. | `src/lib/email/community.ts`; `src/lib/email/templates.ts`; Resend | Connected Resend domain listing returned no domains. | Partially Completed / Blocked for live delivery |
| Public contributor CTA | Partially completed | Footer/site chrome and onboarding route exist; authenticated role-routing paths need browser verification. | `src/components/cms/site-chrome.tsx`; contributor routes; Clerk | Static review only. | Partially Completed |

## Not Started / Newly added in this pass

| Requirement | Previous status | Work performed | Files created / modified | Integration | Testing | Final status |
|---|---|---|---|---|---|---|
| Contributor-owned article update and delete endpoints | Not Started | Added server-side ownership checks, contributor/admin authorization, editable-status restrictions, category validation and deletion restrictions. | `src/app/api/contributor/articles/[id]/route.ts` | Clerk session + Sanity write client | TypeScript/build validation pending; no live mutation performed. | Implemented; verification pending |
| Reuse created article ID in editor | Not Started | Editor now captures the ID returned by the create endpoint and uses PATCH for subsequent saves rather than creating duplicate articles. | `src/components/community/article-editor.tsx` | Next.js API + Sanity | TypeScript and production build pass. | Implemented; verification pending |

## Pending / Blocked

| Requirement | Exact blocker | Required external action | Current status |
|---|---|---|---|
| Single authorized Admin account | `URBAN_STORIES_ADMIN_USER_IDS` is configured as a secret variable in Preview and Development, but its value is intentionally not read or exposed; the Clerk owner user ID has not been confirmed/provisioned in this audit. | Confirm the intended owner Clerk user ID and set it in the existing Vercel Preview/Development allowlist variable. Do not send credentials in chat. | Pending / Blocked |
| Transactional email delivery | Resend reports no registered sending domains. | Add and verify a sending domain in Resend and configure its DNS records; then set `RESEND_FROM_EMAIL` to an address on that verified domain. | Pending / Blocked |
| Live Sanity Studio schema registration | Local Studio schema source exists, but `get_schema` reported no deployed schema registration. | Confirm deployment target dataset (`development`) and deploy the local Studio schema from the project; do not create duplicate MCP-managed schemas. | Pending / Blocked |
| Production authentication setup | Connected Clerk application currently exposes only a development instance; no production instance is listed. | When the production domain is ready, create/configure the Clerk production instance, OAuth credentials, and domain verification. | Pending / Blocked |

## Validation snapshot

- `npm run lint`: still fails on existing repository-wide ESLint debt (42 errors and 12 warnings in the latest run, predominantly explicit `any`, React effect state updates and `<img>` usage). The new editor/API files type-check, but the repository lint baseline is not clean.
- `npx tsc --noEmit`: passed after this implementation pass.
- Sanity development GROQ query: succeeded; returned 9 documents including 4 published articles, 1 author, 3 categories and 1 siteSettings document.
- Resend domain listing: no domains found.
- Clerk development configuration: Google OAuth enabled, email verification enabled, password auth enabled; sign-up mode is public. Discord OAuth is also enabled. Password minimum length is 15. Username is required by current Clerk configuration.
- Preview deployment before this implementation pass: READY at `https://urbanstories-mm9kp2ama-shanky43s-projects.vercel.app`.
- No production deployment or merge to `main` was performed.
