# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a two-app repo: `watermark-project/` (frontend) and `server/` (backend). Run commands
from within each app's directory, not the repo root.

### Environment setup

```bash
docker compose up -d                    # from repo root — starts Postgres on localhost:5433
cd server && cp .env.example .env       # first time only
cd server && npx prisma migrate dev     # applies schema, generates Prisma client
```

Postgres is mapped to host port **5433**, not 5432 — a native Postgres install commonly already
owns 5432 on macOS, so `docker-compose.yml` and `server/.env`'s `DATABASE_URL` both use 5433.

### Backend (`server/`)

```bash
npm run dev             # tsx watch, http://localhost:4000
npm run build            # tsc -b
npm run typecheck         # tsc -p tsconfig.test.json — src AND tests (main tsconfig only covers src)
npm test                   # vitest run — integration tests against a real watermark_test DB
npm run test:coverage       # vitest run --coverage
npx prisma migrate dev --name <name>   # after editing prisma/schema.prisma
npx prisma studio         # browse the DB
```

### Frontend (`watermark-project/`)

```bash
npm run dev       # Vite dev server, proxies /api and /uploads to localhost:4000
npm run build      # tsc -b && vite build
npm run lint        # eslint .
npm test             # vitest run — unit + component tests (jsdom)
npm run test:e2e      # playwright test — needs the backend already running (see Testing below)
npx tsc -b --noEmit    # type-check only
```

## Architecture

### Two independent apps, no shared package

`server/` and `watermark-project/` are separate npm projects with no workspace/monorepo tooling
and no shared package between them — the small set of overlapping shapes (watermark/preset
fields) is intentionally duplicated in `server/src/types` conventions and
`watermark-project/src/types/watermark.ts` rather than adding build tooling for it. In dev, Vite
proxies `/api` and `/uploads` to the backend (`vite.config.ts`) so the frontend always calls
same-origin paths.

### Client-side-only image processing

All watermark rendering happens in the browser on `<canvas>`. The backend never receives or
stores full-resolution images — only small logo PNGs (`server/uploads/logos/`) and downscaled
history thumbnails (`server/uploads/thumbnails/`, generated client-side before upload). This is
a deliberate constraint, not an oversight: don't add server-side image processing without
revisiting it.

### Single render function is the source of truth

`watermark-project/src/lib/canvasRender.ts`'s `renderWatermarkedImage()` is called from three
places — the live interactive preview, full-resolution export/download, and thumbnail
generation for history — always with the same watermark config, just a different target canvas
size. This guarantees the downloaded file and the history thumbnail always match what the user
saw in the preview. When changing watermark rendering, change it here, not in three places.

Watermark position (`x`, `y`) is stored **normalized to 0..1**, not pixels, both in the frontend
state (`useWatermarkCanvas` reducer) and in the `Preset` DB rows (`textPositionX/Y`,
`logoPositionX/Y`). This is what lets a saved preset apply correctly to a differently-sized image
later, and lets the same config drive the capped-resolution preview and the full-res export
without rescaling math at each call site.

Drag-to-reposition (`WatermarkCanvas.tsx`) hit-tests pointer coordinates against the text's
`ctx.measureText` bounding box or the logo's drawn rect (`getLogoDrawRect`), converts
`clientX/Y` through `canvas.getBoundingClientRect()` scaling to canvas-pixel space, then
normalizes by canvas width/height before dispatching the update.

### Auth: single JWT cookie, no refresh token

`server/src/lib/jwt.ts` signs a 7-day JWT on register/login, set via `res.cookie` as httpOnly,
`sameSite: lax` (see `auth.controller.ts`). `server/src/middleware/auth.middleware.ts` verifies
it and attaches `req.user`. There is deliberately no refresh-token rotation — this is a v1
trade-off for a small app, not an oversight. On the frontend, `AuthContext`
(`src/context/AuthContext.tsx` + `src/context/auth-context.ts`, split across two files to satisfy
the `react-refresh/only-export-components` lint rule) calls `GET /api/auth/me` once on mount to
rehydrate from the cookie; `ProtectedRoute` gates `/dashboard`. `/editor` itself is intentionally
**public** — watermarking and downloading works without an account; login is only required to
save presets/logos/history.

### Data model (`server/prisma/schema.prisma`)

`User 1—N Logo/Preset/HistoryItem`, all cascade-deleted with the user. A `Preset` can hold text
config, logo config, or both simultaneously — there's no separate "enabled" boolean; a field
group is considered active based on `textContent != null` or `logoId != null`. Deleting a `Logo`
uses `onDelete: SetNull` on `Preset.logoId`, so referencing presets degrade to text-only (or
empty) instead of breaking — this is enforced by the schema, so don't reintroduce a stored
"logo enabled" flag that could go out of sync with `logoId`.

### Design system: dark-default theme, shared buttons, split navigation

`src/index.css` defines the design tokens with **dark as the base `:root`**, not a
`prefers-color-scheme: dark` override — light mode is the override
(`@media (prefers-color-scheme: light)`), inverted from the typical pattern. `--gradient-primary`
(purple→blue) matches `public/favicon.svg`/the PWA icons — keep any new accent gradient consistent
with that source rather than introducing a second brand gradient. `--radius-sm/md/full` and
`--border-strong` (for dashed/low-contrast elements like `ImageDropzone` that need more contrast
than `--border`) are used app-wide; prefer them over hardcoded radius/border values in new CSS.

`src/styles/buttons.module.css` is the single shared button system (`.btn` + `.btnPrimary` /
`.btnSecondary` / `.btnDanger`, `.btnSmall`/`.btnFull` modifiers) — every button in the app uses
it. Don't add a one-off styled `<button>`; add a modifier here if the existing variants don't fit.

Navigation is split by viewport rather than one responsive component: `components/layout/Topbar.tsx`
(brand always, full link row only ≥768px) and `components/layout/BottomNav.tsx` (fixed, icon tabs,
only <768px, `App.css`'s `.page` reserves bottom padding on mobile so it never overlaps content).
Both render simultaneously in `App.tsx`; `display:none` via CSS media queries decides which shows,
not JS viewport detection. `components/layout/icons.tsx` holds small hand-written inline SVG line
icons — no icon library dependency.

**Flex/grid `min-width` gotcha**: `WatermarkCanvas`'s wrapper is a flex container and
`EditorPage`'s two-column layout is a CSS grid, both with a `<canvas>` (a replaced element with a
large intrinsic pixel size) inside. Flex/grid items default to `min-width: auto`, which uses the
item's intrinsic content size as a floor **regardless of `max-width: 100%`** — this caused a real
horizontal-overflow bug on mobile with a wide source photo. Both now have explicit `min-width: 0`
(and the grid uses `minmax(0, 1fr)` instead of `1fr`). Keep this in mind before adding more
replaced elements (`<img>`, `<canvas>`, `<video>`) into flex/grid layouts elsewhere.

### PWA / offline support

`watermark-project` is installable via `vite-plugin-pwa` (configured in `vite.config.ts`),
enabled in dev too (`devOptions.enabled: true`) so service-worker behavior is testable without a
production build. This is only possible *because* watermarking is client-side-only (see above):
the precached app shell lets `/editor` fully work offline (upload, watermark, drag, export) once
visited once online. `/api/*` and `/uploads/*` are excluded from the navigate fallback and use a
`NetworkFirst` runtime strategy — auth, presets, logos, and history correctly fail/degrade offline
rather than serving stale cached responses. PWA icons (`public/pwa-*.png`,
`public/maskable-512x512.png`, `public/apple-touch-icon.png`) are generated from
`public/favicon.svg`; regenerate them all together if the source icon changes.

### Testing

Three layers, all committed (no more one-off scratch scripts):

- **Backend** (`server/tests/`): Vitest + Supertest against the real Express `app` (no HTTP
  server needed). A dedicated `watermark_test` Postgres DB — the same Docker container as dev,
  different database name — is created and migrated by `tests/global-setup.ts` on every run.
  `tests/helpers/db.ts`'s `resetDb()` runs in `beforeEach` in every integration test file, which
  is why **`vitest.config.ts` sets `fileParallelism: false`**: test files share one DB, and
  running them in parallel races one file's `resetDb()` against another file's in-flight test
  (this caused real, confusing cross-file failures before the fix — don't re-enable parallelism
  without solving DB isolation differently). `tests/helpers/auth.ts`'s `registerAndLogin()` uses
  `supertest.agent()` so the session cookie persists across calls like a real browser. Uploads
  during tests go to `UPLOADS_DIR=./uploads-test` (env-overridable in `upload.middleware.ts`), not
  the real `uploads/` dir.
- **Frontend unit/component** (`src/**/*.test.{ts,tsx}`, colocated with source): Vitest + jsdom +
  React Testing Library, config in `vitest.config.ts`/`vitest.setup.ts` (separate from
  `vite.config.ts` to keep `vite-plugin-pwa` out of the test environment).
  `vitest-canvas-mock` mocks `CanvasRenderingContext2D` for `canvasRender.test.ts` — its
  `drawImage` mock validates the argument against real DOM constructors, so test fixtures must be
  actual `<canvas>`/`<img>` elements, not plain objects cast to `CanvasImageSource`. `apiClient`
  and `useAuth` are mocked per-test-file with `vi.mock` (no MSW, consistent with the project's
  minimal-dependency approach elsewhere).
- **E2E** (`watermark-project/e2e/`): `@playwright/test`, config in `playwright.config.ts`.
  **The backend is a documented precondition, not auto-started** — `e2e/global-setup.ts` fails
  fast with a clear message if `localhost:4000/api/health` isn't reachable, rather than a
  mysterious timeout. The frontend dev server *is* auto-started via `webServer`. A second
  Playwright project (`pwa`) runs `pwa.spec.ts` against `npm run preview` (a real production
  build) since service-worker behavior differs from dev mode — both `webServer` entries
  (dev + build/preview) start on every `playwright test` run regardless of `--project` filter,
  a deliberate simplicity trade-off over conditionally orchestrating them.
  **`vitest.config.ts` excludes `e2e/**`** — Playwright's `*.spec.ts` naming collides with
  Vitest's default test glob, and without the exclusion `npm test` tries to collect and run
  Playwright specs as Vitest tests (fails immediately, confusingly).

CI (`.github/workflows/ci.yml`) runs backend/frontend/e2e as separate jobs, each with its own
`postgres:16-alpine` service container (GitHub Actions native `services:`, not docker-compose).

### Uploads

`server/src/middleware/upload.middleware.ts` uses `multer.diskStorage` writing directly to
`server/uploads/{logos,thumbnails}/`, served via `express.static`. Logo uploads are restricted to
PNG; thumbnail size limits assume the frontend has already downscaled before uploading (the
backend doesn't resize anything itself). If storage needs to move to S3 or similar, only this
middleware and the two `*Dir` constants it exports need to change — controllers just receive
`req.file`.
