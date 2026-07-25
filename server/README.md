# Watermark backend

Express + TypeScript API backing the watermark app's membership system: accounts, saved
watermark presets, reusable logo assets, and a thumbnail-only history of past exports. It never
touches full-resolution images — all watermark rendering happens client-side.

## Development

```bash
cp .env.example .env        # adjust if needed
docker compose up -d        # from the repo root — starts Postgres on localhost:5433
npm install
npx prisma migrate dev      # applies the schema and generates the Prisma client
npm run dev                 # starts the API on http://localhost:4000
```

## Scripts

- `npm run dev` — start the API with hot reload (`tsx watch`)
- `npm run build` — type-check and compile to `dist/`
- `npm start` — run the compiled build
- `npm run prisma:studio` — open Prisma Studio to browse the database

## API

See `prisma/schema.prisma` for the data model (`User`, `Logo`, `Preset`, `HistoryItem`) and
`src/routes/` for the full endpoint list — auth (`/api/auth`), logos (`/api/logos`), presets
(`/api/presets`), and history (`/api/history`), all namespaced under `/api`.
