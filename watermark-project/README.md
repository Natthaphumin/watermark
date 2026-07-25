# Watermark frontend

React + TypeScript + Vite app for the watermark editor: upload a photo, add a text and/or logo
watermark on a `<canvas>`, drag it into place, and download the result. Talks to the API in
`../server`.

Installable as a PWA (`vite-plugin-pwa`) — the editor (upload/watermark/drag/download) works
fully offline once loaded, since watermarking never leaves the browser. Presets/logos/history
still need a network connection, since those live on the backend.

## Development

```bash
npm install
npm run dev
```

Requires the backend running at `http://localhost:4000` (see `../server/README.md`) — `vite.config.ts`
proxies `/api` and `/uploads` there so the app can just call `/api/...` regardless of environment.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally
