# Ride and Serve — Full Project (Frontend + Backend)

## Folder structure
```
RideNServe-Full/
├── frontend/     → original website (all pages, css, js, images) + auth.html connected to backend
└── backend/      → Node.js + Express + MongoDB API (signup/OTP/login/Google auth)
```

## Quick start

### 1. Backend
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:3000`. All secrets already set in `backend/.env`.

### 2. Frontend
Open `frontend/auth.html` with VS Code **Live Server** (port 5500), or serve the whole
`frontend` folder with any static server.

Full setup, API docs, and Vercel deployment steps are in `backend/README.md`.

## Reminder
- Rotate the MongoDB Atlas password after development (it was shared during setup).
- Add all `.env` values manually in Vercel's dashboard before deploying the backend — Vercel
  does not read local `.env` files.
- After deploying, update `API_BASE_URL` inside `frontend/auth.html` with your live backend URL.
