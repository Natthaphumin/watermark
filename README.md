# Watermark

A web app for watermarking photos: upload an image, add a text and/or logo watermark with a
live drag-to-reposition preview, and download the result — all rendered client-side on
`<canvas>`. An account lets you save reusable watermark presets, a logo library, and a
thumbnail history of past exports.

## Structure

- [`watermark-project/`](watermark-project) — React + TypeScript + Vite frontend
- [`server/`](server) — Express + TypeScript + Prisma/PostgreSQL backend (auth, presets, logos, history)
- `docker-compose.yml` — local PostgreSQL for development

## Quick start

```bash
docker compose up -d
cd server && npm install && npx prisma migrate dev && npm run dev &
cd watermark-project && npm install && npm run dev
```

Then open the frontend dev server URL (Vite prints it, typically `http://localhost:5173`).
See `server/README.md` and `watermark-project/README.md` for details.