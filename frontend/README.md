# Finding Worker — Frontend

React + Vite frontend for the Finding Worker platform.

## Quick start (frontend only)

The project is configured in **demo mode by default**, so the UI can be opened without running the Spring Boot backend.

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

Open the address Vite prints (normally `http://localhost:5173`).

Demo mode includes sample workers, categories, ratings and browser-local bookings. It is intended for presentation/testing of the frontend.

## Use the real Spring Boot backend

1. Set `VITE_DEMO_MODE=false` in `.env`.
2. Set `VITE_API_URL` to your backend origin, e.g. `http://localhost:8080`.
3. Start the backend.
4. Run `npm run dev`.

Google OAuth and authenticated actions are only available with the real backend.

## Production

```bash
npm run build
npm run preview
```

The existing `vercel.json` can be used for Vercel deployment. Set `VITE_DEMO_MODE=false` and the production `VITE_API_URL` when deploying against a real backend.
