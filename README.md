# Momently — Landing Page (Phase 1: Frontend Only)

A production-quality Next.js 15 App Router frontend for Momently, a personalized
digital-memories marketplace. This phase is UI-only — no backend, auth, database,
or payments.

## Stack

- Next.js 15 (App Router, Server Components by default)
- TypeScript
- Tailwind CSS (custom design tokens in `tailwind.config.ts`)
- Framer Motion (client components only, where animation is required)
- Lucide Icons

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

> Note: `next/font` fetches Playfair Display and Inter from Google Fonts at build
> time, so an internet connection is required for `npm run build` / `npm run dev`
> to compile successfully.

## Structure

```
app/
  layout.tsx        Root layout, fonts, metadata
  page.tsx           Composes all landing sections
  globals.css        Base styles, design tokens as utilities
components/
  layout/            Navbar, Footer
  hero/               Hero section + signature card-stack animation
  sections/           Why Choose Us, How it Works, Featured Templates,
                       Testimonials, Pricing, FAQ
lib/
  data.ts            Static content (templates, testimonials, pricing, FAQ)
  utils.ts           cn() class-merge helper
types/
  index.ts           Shared TypeScript interfaces
```

## Design tokens

| Role | Value | Notes |
|---|---|---|
| Deep Love Red | `#7A1E2B` | Primary — CTAs, active states |
| Soft Pink | `#F1D6D9` | Secondary — section tints |
| Paper (bg) | `#FDFBF9` | Warm white, not stark |
| Ink (dark bg) | `#12100F` | Near-black, warm undertone |
| Birthday accent | `#3E6D9C` | Blue |
| Anniversary accent | `#C97B92` | Pink |
| Proposal accent | `#8C1D2B` | Red |
| Wedding accent | `#B8964F` | Gold |

Type: Playfair Display (display/headings), Inter (body/UI).

## Signature interaction

The hero's four overlapping square template cards start stacked, pop out one
by one on load with a spring animation, and tilt in 3D on mouse move
(`components/hero/hero-card-stack.tsx`). Reduced-motion preferences are
respected globally via `globals.css`.

## Next phases (not built yet, by design)

- Backend API routes
- Authentication
- Database
- Payments / checkout

---

## Database Layer (Prisma + PostgreSQL)

This is the core data model for Momently as a SaaS product: Users create
Projects from Templates, each Project owns an ordered Media collection, and
Orders record payment for premium Templates. Auth, payments, uploads, and API
routes are intentionally **not** implemented at this stage — this is the data
layer only.

### Folder structure

```
prisma/
  schema.prisma       Models, enums, relations, indexes (documented inline)
  seed.ts             Idempotent seed: 10 templates, 1 admin user, 3 projects
lib/
  prisma.ts           Singleton PrismaClient (safe for Next.js dev hot-reload)
.env.example          DATABASE_URL placeholder
```

### Models

| Model | Purpose |
|---|---|
| `User` | Account record. `password` is nullable to support OAuth-only accounts later. `role` (`USER`/`ADMIN`) gates admin surfaces. |
| `Template` | Marketplace template a Project is created from. `previewImages` is a native Postgres `text[]`. `price` is `Decimal(10,2)` — never use `Float` for money. |
| `Project` | A user's memory page. Owns `theme`/`font`/`primaryColor`/`secondaryColor` as plain scalars (simple, queryable, matches how the studio edits them one field at a time). |
| `Media` | One photo/video/music asset on a Project, with an `order` for sequencing. |
| `Order` | A payment record tied to a User + Project. `razorpayOrderId` is unique-but-nullable (set once the gateway order exists). |

### Relationships & cascade strategy

- `User → Project`: **Cascade**. Deleting a user deletes their projects (and transitively their media/orders) — no orphaned content.
- `Project → Media`: **Cascade**. Media has no meaning independent of its project.
- `User → Order`, `Project → Order`: **Cascade**, for this stage of the schema. A real production system would more likely soft-delete or anonymize financial records instead of hard-deleting them — flagged in the schema comments as a deliberate simplification to revisit before launch.
- `Template → Project`: **Restrict**. A template that's in use by any project cannot be deleted out from under it.

### Indexes & constraints

- Unique: `User.email`, `Template.slug`, `Project.slug`, `Order.razorpayOrderId`.
- Indexed for frequent queries: `User.email`, `User.role`, `Template.category`, `Template.isPremium`, `Template.createdAt`, `Project.userId`, `Project.templateId`, `Project.status`, `Media.projectId`, `Media.type`, `Media.[projectId, order]` (composite, for ordered gallery fetches), `Order.userId`, `Order.projectId`, `Order.paymentStatus`.
- Defaults: `role = USER`, `status = DRAFT`, `isPremium = false`, `price = 0`, `paymentStatus = PENDING`, `currency = "INR"`, `Media.order = 0`, all `createdAt`/`updatedAt` timestamps.

### Migration commands

```bash
cp .env.example .env        # set DATABASE_URL to a real Postgres instance
npm install
npx prisma generate          # generates the typed client from schema.prisma
npx prisma migrate dev --name init   # creates prisma/migrations/ and applies it
npm run db:seed              # tsx prisma/seed.ts — idempotent, safe to re-run
npx prisma studio             # optional: browse the seeded data
```

> As with the previous backend pass, this sandbox's network can't reach
> `binaries.prisma.sh` (needed by `prisma generate`/`migrate`) or a working
> `apt` mirror for a local Postgres install, so the migration itself
> couldn't be executed and verified here. The schema was instead verified by
> (1) a full `tsc --noEmit` pass — the only errors are "missing generated
> member" errors in files that reference `@prisma/client` types, which
> resolve the moment `prisma generate` succeeds — and (2) manual review of
> every relation, cascade rule, and index against the spec. Both commands
> work normally with standard internet access.

### ⚠️ Known consequence of this schema replacing the previous one

The previous session wired the Customization Studio's backend (`app/actions/memory-actions.ts`,
`lib/memory-page-mapper.ts`, `app/api/upload/*`, `app/customize/[templateId]/page.tsx`,
and the NextAuth config) against a different, `MemoryPage`-shaped schema
(`MemoryPage`, `Photo`, `Video`, `TimelineEvent`, `Sticker`, `ElementProperty`,
`MusicTrack`). This task replaced that schema with the `Project`/`Template`/
`Media`/`Order` model above, per this task's explicit spec — and per this
task's instructions, I did not touch any API routes, server actions, or
frontend code to reconcile them. That means those specific backend files now
reference Prisma models that no longer exist and will not compile as-is.
They're straightforward to re-point at `Project`/`Media` (the shapes are
close — `Project` ≈ old `MemoryPage`, `Media` ≈ old `Photo`/`Video` unified),
but that reconciliation is a separate task from what was asked here. Flagging
this now rather than leaving it to surprise you at build time.

### Best practices applied

- **Singleton Prisma Client** (`lib/prisma.ts`) — reuses one client across
  Next.js dev hot-reloads instead of exhausting Postgres connections.
- **`cuid()` primary keys** — collision-resistant, sortable-enough, no
  round-trip to the DB needed to generate an ID client-side.
- **`Decimal` for money**, never `Float`/`Int` cents-as-float — avoids
  floating-point rounding bugs in `Template.price`/`Order.amount`.
- **`@@map`** on every model — DB table names stay `snake_case`/plural
  (`users`, `templates`, `projects`, `media`, `orders`) independent of the
  PascalCase Prisma model names, which is the conventional split.
- **Composite index** on `Media.[projectId, order]` — the studio's gallery
  and timeline always fetch "this project's media, in order," so the index
  matches the actual query shape rather than indexing each column alone.
- **Idempotent seed** — every seed row uses `upsert` keyed on a unique
  field, so re-running `db:seed` after schema changes never duplicates data.
- **Restrict vs. Cascade chosen deliberately per relation**, not
  uniformly — documented inline in the schema next to each `onDelete`.




## Media Upload System (Supabase Storage)

Images, videos, and background music uploaded in the Customization Studio
persist immediately — as soon as a file finishes uploading, not just when
the user clicks Save Draft — through Supabase Storage and the `Media`
table. (Originally built on Cloudinary; migrated to Supabase Storage —
see "Cloudinary → Supabase Storage migration" below for what changed.)

### Environment variables

Add to `.env` (see `.env.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Architecture

```
lib/supabase-storage.ts     MediaStorage abstraction (upload/remove/duplicate)
                            + the active Supabase Storage implementation
validators/media.schema.ts  UPLOAD_CONSTRAINTS (size/extension per kind) —
                            single source of truth, reused by both
                            validation and the service layer
repositories/
  media.repository.ts       Pure Prisma CRUD + reorderMany (transactional)
services/
  media.service.ts           Ownership checks, storage calls, business logic
app/actions/
  media.actions.ts           uploadImage, uploadVideo, uploadMusic,
                              replaceMedia, deleteMedia, reorderMedia
app/api/
  upload/image|video|music/route.ts   POST — multipart/form-data
  media/[id]/route.ts                  DELETE
  media/reorder/route.ts               PATCH
```

### Supported files & limits

| Kind | Extensions | Max size | Supabase Storage path |
|---|---|---|---|
| Image | jpg, jpeg, png, webp | 10MB | `momently-media/images/` |
| Video | mp4, mov, webm | 100MB | `momently-media/videos/` |
| Music | mp3, wav | 20MB | `momently-media/audio/` |

All three live in a single bucket, `momently-media`, split by folder.

### The Studio now auto-provisions a draft Project

Uploading a photo before ever clicking "Save Draft" only works if there's
already a `projectId` for it to attach to. `app/customize/[templateId]/page.tsx`
now calls `projectService.getOrCreateStudioProject()` on every visit, which
creates a minimal DRAFT `Project` row on first visit and reuses it after —
so `StudioProvider` always receives a real database id, and every upload
component can call `uploadImage`/`uploadVideo`/`uploadMusic` immediately.

This also simplified `saveDraft`/`publishProject`: since media persists
live through its own actions, Save Draft/Publish no longer touch the
`Media` table at all — they're now thin wrappers around `updateProject`
that just flip `status` (and `publishedAt`).

### Retry, delete, and replace — without new UI

The spec asked for retry-on-failure and delete/replace, but the existing
upload UI has no progress bar or retry button to wire up (only a spinner).
Rather than add new UI elements:

- **Retry** happens automatically and silently (`lib/upload-client.ts`'s
  `withRetry`) — a couple of retries with backoff before falling back to
  keeping the optimistic local preview, so a transient network blip
  resolves itself instead of requiring the user to notice and re-click
  something that doesn't exist.
- **Delete** now actually calls the backend (`deleteMedia`), which removes
  both the storage asset and the DB row — previously the sidebar's remove
  button only cleared local state.
- **Reorder** is fully implemented end-to-end (`reorderMedia` action +
  route + service, transactional in the repository), but isn't wired to a
  click handler: the current Photo gallery has no drag-to-reorder control
  to attach it to (unlike the Timeline, which already has up/down arrows
  for its own, unrelated `TimelineEvent` ordering). Ready the moment such
  a control exists.
- **Upload progress** stays the existing spinner/`Loader2` treatment —
  a numeric progress bar would be a new UI element.

### Duplicate Project re-uploads media under fresh object keys

`projectService.duplicateProject` calls `mediaStorage.duplicate()`
(download-then-reupload) for each source media item rather than pointing
the copy at the same Supabase Storage object key. Sharing an object key
between two projects would mean deleting media on either one could delete
the underlying file out from under the other — re-uploading avoids that
at the cost of one extra download+upload per asset per duplication.

### Cloudinary → Supabase Storage migration

The `MediaStorage` interface (`upload`/`remove`/`duplicate`) was designed
from the start so the provider behind it could be swapped without
touching any calling code — this migration is that design paying off.

**What changed:**
- `lib/cloudinary.ts` deleted; `lib/supabase-storage.ts` added, exporting
  the exact same `MediaStorage`/`StorageResourceType`/`StorageUploadInput`/
  `StorageUploadResult`/`STORAGE_FOLDERS` names.
- The 4 files that imported from `lib/cloudinary` (`types/media.ts`,
  `services/media.service.ts`, `services/project.service.ts`,
  `validators/media.schema.ts`) only needed their import path updated —
  zero business-logic changes.
- `Media.publicId` now stores a Supabase Storage object path (e.g.
  `images/<uuid>.jpg`) instead of a Cloudinary `public_id` — same DB
  column, same purpose (identifies the asset for `remove`/`duplicate`),
  no schema migration needed.
- `filenameHint` now carries the file's real extension (previously
  stripped, since Cloudinary auto-detects format from the binary content;
  Supabase needs the extension to build a usable object key). This only
  changed how `media.service.ts` populates one field when calling
  `mediaStorage.upload()` — not any externally-visible behavior.
- `cloudinary` removed from `package.json`; `@supabase/supabase-js` added.
- All `CLOUDINARY_*` env vars removed; replaced with
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
  `SUPABASE_SERVICE_ROLE_KEY`.

**Manual steps required in Supabase (not doable from code):**
1. Create a bucket named exactly `momently-media`.
2. Set it **Public** (Storage → momently-media → Configuration), so
   `getPublicUrl()` returns a URL that actually resolves. If you'd rather
   keep it private, swap `getPublicUrl` for `createSignedUrl(path, expirySeconds)`
   in `lib/supabase-storage.ts` and store/refresh signed URLs instead —
   noted here since the spec allows either.
3. No need to pre-create the `images/`/`videos`/`audio/` "folders" —
   Supabase Storage creates path prefixes implicitly on first upload.
4. Copy the Project URL, anon key, and service role key from
   Settings → API into `.env`.

**Commands to run:**
```bash
npm install        # picks up @supabase/supabase-js, drops cloudinary
npx prisma generate # no schema changes in this migration, but harmless to rerun
npm run dev
```

### Verification note

Supabase's Storage API and `binaries.prisma.sh` (needed for
`prisma generate`) are both unreachable from this sandbox's network
allowlist, so the actual upload flow couldn't be exercised end-to-end here.
Verified instead via a full `tsc --noEmit` pass: the only errors are the
same "missing generated Prisma client member" category as previous passes
(confirmed by manual inspection of every implicit-`any` site), which
resolve the moment `prisma generate` runs with real network access. Zero
explicit `any` anywhere in the new code.

## Payment System (Razorpay)

Publishing a project built from a premium (non-zero-price) Template now
requires a successful Razorpay payment. Free templates publish immediately,
same as before.

### Environment variables

```bash
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
```

### Architecture

```
prisma/schema.prisma        Payment model (replaces the previously-unused
                              Order model — confirmed nothing referenced it)
lib/razorpay.ts              Order creation + HMAC-SHA256 signature verification
validators/payment.schema.ts createPaymentOrderSchema, verifyPaymentSchema
repositories/
  payment.repository.ts       Pure Prisma CRUD
services/
  payment.service.ts           createPaymentOrder, verifyPayment, canPublish
                                (the single source of truth for "does this
                                project need payment before publishing")
app/actions/
  payment.actions.ts            createPaymentOrder, verifyPayment
app/checkout/[projectId]/page.tsx     Checkout page (server component)
components/Checkout/CheckoutClient.tsx Razorpay modal flow (client)
```

### The publish gate

`projectService.publishProject` now always saves the Studio's latest
content first, then attempts to flip status to PUBLISHED — gated by
`paymentService.canPublish`, which checks the project's template price and,
if non-zero, whether a `SUCCESS` Payment already exists for that project.
If not, it throws `PaymentRequiredError` (402). Content is safely persisted
as DRAFT either way — the gate only blocks the status flip, never the save.

The Studio's existing "Publish" button (`StudioNavbar`) now checks for that
402 and redirects to `/checkout/[projectId]` instead of just showing an
error — no new button, no UI redesign, just a smarter response to the
existing action's result.

After a successful payment, the Checkout page calls a new
`confirmPublish(projectId)` action (a thin wrapper around
`projectService.publishExistingProject`) to flip the already-saved project
to PUBLISHED — it doesn't need to resubmit title/theme/media since none of
that changed between the Studio and the payment redirect.

### Payment failure handling (per spec)

- **Keeps the project in DRAFT**: publishing was never attempted until
  `verifyPayment` succeeds, so a failed/abandoned payment simply never
  reaches `confirmPublish`.
- **Friendly error message**: Razorpay's `payment.failed` event and a
  failed signature verification both surface as plain text in the Checkout
  UI, not a raw error/stack trace.
- **Retry**: the same "Pay & Publish" button becomes "Retry payment" after
  a failure — clicking it calls `createPaymentOrder` again, which creates a
  fresh Razorpay order and Payment row rather than mutating the failed one,
  keeping payment history an honest audit trail.

### Why signature verification matters

`verifyPayment` never trusts Razorpay checkout.js's client-side success
callback alone — it recomputes the HMAC-SHA256 of `order_id|payment_id`
using the key secret (server-side only) and compares it to the signature
Razorpay returns. A mismatch marks the Payment `FAILED` and throws, so a
forged/tampered client-side callback can never unlock publishing.

### Scope notes

- Implemented as Server Actions only (no dedicated `/api/payments/*` Route
  Handlers) — the task didn't enumerate specific payment routes the way
  previous tasks enumerated CRUD/media routes, and Server Actions already
  give the Checkout page everything it needs without a redundant REST layer
  duplicating the same logic.
- The Checkout page is new UI (task 8 explicitly asked for one), styled
  with the same tokens/components as the rest of the app; no existing page
  was redesigned.

### Verification note

Razorpay's API and `binaries.prisma.sh` (needed for `prisma generate`) are
both unreachable from this sandbox's network allowlist, so the live payment
flow couldn't be exercised end-to-end here. Verified instead via a full
`tsc --noEmit` pass: all 32 errors are the same "missing generated Prisma
client member" category seen in every previous backend pass (confirmed by
manual inspection), resolving the moment `prisma generate` runs with real
network access. Zero explicit `any` anywhere in the new code.

## Access, Auth & Payment Hardening

### Access model clarified

- Marketplace browsing and template preview (`/marketplace`, `/marketplace/[slug]`) remain fully public — no login required.
- `Login`/`Create Memory` in the Navbar, and both CTAs in the Hero section, were dead `#hash` links with no matching anchor anywhere on the page — fixed to real routes (`/login`, `/marketplace`). This was the actual "can't reach login from Home/Marketplace" bug.
- **The payment gate moved earlier**: premium (non-zero-price) templates now require payment *before* the Studio opens at all, not just before publishing. `app/customize/[templateId]/page.tsx` checks `paymentService.isProjectUnlocked()` right after provisioning the draft project and redirects to `/checkout/[projectId]` if unpaid. The publish-time check still exists too, as defense-in-depth. `payment.service.ts`'s `canPublish` was renamed to `isProjectUnlocked` to reflect that it now gates both.
- `middleware.ts` now also covers `/checkout/:path*`, not just `/customize/:path*`, for consistent edge-level auth gating (Checkout previously only had a page-level check, which worked but was inconsistent with Customize).

### Payment gateway: webhook added (the most urgent prior gap)

`app/api/webhooks/razorpay/route.ts` is new. Previously, "payment succeeded" was only ever recorded when the browser called `verifyPayment` after checkout.js's success callback — if the user closed the tab right after Razorpay captured the payment but before that call ran, the Payment row would be stuck `PENDING` forever with no way to reconcile it. The webhook is now the reliable, server-to-server source of truth:

- Verifies `X-Razorpay-Signature` against the **raw** request body using a separate `RAZORPAY_WEBHOOK_SECRET` (not the API key secret) — `lib/razorpay.ts`'s `verifyRazorpayWebhookSignature`.
- Deliberately has no session auth (Razorpay's servers send no cookies) — signature verification *is* the protection for this route.
- `paymentService.handleWebhookEvent` is idempotent: re-delivery of the same `payment.captured` event is a safe no-op.
- Configure the URL in Razorpay Dashboard → Settings → Webhooks, subscribed to `payment.captured`.

### Rate limiting

`lib/rate-limit.ts` — a simple in-memory sliding-window limiter. Applied to:
- **Login** (`lib/auth.ts`'s `authorize()`): 10 attempts / 5 min per email.
- **Signup** (`app/api/auth/signup/route.ts`): 5 accounts / hour per IP.
- **Payment order creation** (`payment.service.ts`): 5 attempts / 10 min per user.

This is in-memory and per-process — it does **not** share state across multiple server instances or serverless invocations. Fine for a single-instance deployment; for real multi-instance production traffic, swap in a shared store (e.g. Upstash Redis + `@upstash/ratelimit`) behind the same `checkRateLimit()` signature, and every call site keeps working unchanged.

### Session duration

`authOptions.session.maxAge` is now explicit (7 days) instead of relying on NextAuth's silent 30-day default.

### Still open (flagged, not built this pass)

- **No password reset flow** — needs a reset-token model + an actual email provider (Resend/SendGrid/etc.) to deliver the link; out of scope until you want to pick a provider.
- **No email verification at signup.**
- **No stale-PENDING-payment cleanup** — abandoned checkouts accumulate as `PENDING` rows indefinitely (harmless, just not tidied up).
