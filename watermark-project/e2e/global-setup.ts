// This file is executed once before all tests. It checks if the backend is reachable and throws an error if not, providing instructions to start the backend.
export default async function globalSetup() {
  const backendUrl = "http://localhost:4000/api/health";
  try {
    const res = await fetch(backendUrl);
    if (!res.ok) throw new Error(`unexpected status ${res.status}`);
  } catch (err) {
    throw new Error(
      `Backend not reachable at ${backendUrl} — e2e tests need it running.\n` +
        `From the repo root: docker compose up -d && cd server && npm run dev`,
      { cause: err },
    );
  }
}
