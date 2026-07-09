# Ride and Serve — Backend API

Node.js + Express + MongoDB backend for the Ride and Serve website.
Handles: email/password signup with OTP verification, login, and Google Sign-In.

## Features
- Signup with name/email/password → 6-digit OTP sent to email → account activated after verification
- Login with email/password (JWT issued)
- Google Sign-In (ID token verified server-side, account auto-created/linked)
- Passwords hashed with bcrypt
- Rate limiting on auth & OTP routes
- Ready to deploy on Vercel (serverless) or run as a normal Node server

## 1. Local setup

```bash
cd backend
npm install
npm run dev
```

Server runs on `http://localhost:3000`.

All secrets are already filled in `.env` (Mongo URI, JWT secret, Google credentials, Gmail app password).
**Do not commit `.env` to GitHub** — it's already in `.gitignore`.

## 2. API Endpoints

Base URL: `/api/auth`

| Method | Route          | Body                              | Description                          |
|--------|----------------|------------------------------------|---------------------------------------|
| POST   | `/signup`      | `{ name, email, password }`        | Creates account, sends OTP email      |
| POST   | `/verify-otp`  | `{ email, otp }`                   | Verifies OTP, returns JWT + user      |
| POST   | `/resend-otp`  | `{ email }`                        | Resends a new OTP                     |
| POST   | `/login`       | `{ email, password }`              | Returns JWT + user (must be verified) |
| POST   | `/google`      | `{ credential }` (Google ID token) | Signs in/up via Google, returns JWT   |
| GET    | `/me`          | Header: `Authorization: Bearer <token>` | Returns current logged-in user   |

All responses: `{ success: boolean, message: string, ... }`

## 3. Frontend

`auth.html` (in the `frontend` folder) is already wired up to call these APIs:
- Signup form → `/signup` → shows OTP box → `/verify-otp`
- Login form → `/login`
- Google button → `/google`

Open `frontend/auth.html` with **VS Code Live Server** (port 5500) or serve it from Express — both
origins are already whitelisted in Google Cloud Console and in `CLIENT_ORIGINS`.

**Important:** in `auth.html`, near the top of the `<script>` tag, there's:
```js
const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api'
  : 'https://YOUR-BACKEND-DOMAIN.vercel.app/api';
```
Replace `YOUR-BACKEND-DOMAIN` with your real Vercel backend URL after deploying (step 4).

## 4. Deploy to Vercel

```bash
npm i -g vercel
cd backend
vercel
```

After deploying, go to your project on vercel.com → **Settings → Environment Variables** and add
every variable from `.env` (MONGO_URI, JWT_SECRET, JWT_EXPIRES_IN, GOOGLE_CLIENT_ID,
GOOGLE_CLIENT_SECRET, EMAIL_USER, EMAIL_APP_PASSWORD, CLIENT_ORIGINS) — Vercel does **not** read
your local `.env` file, secrets must be added manually in the dashboard.

Then redeploy (`vercel --prod`), copy the live URL, and:
1. Paste it into `API_BASE_URL` in `auth.html`
2. Add it to **Authorized JavaScript origins** in Google Cloud Console (Credentials → your OAuth client)
3. Add it to `CLIENT_ORIGINS` env var on Vercel (comma-separated with your frontend's live domain too)

## 5. Notes
- OTP expires in 10 minutes; user can request a new one via `/resend-otp`.
- Google sign-in always marks the account as verified (no OTP needed).
- If a user signs up with email but never verifies, signing up again with the same email resends
  a fresh OTP instead of blocking them.
- Change the MongoDB Atlas database user password after development is done, since it was shared
  in plain text during setup — rotate it from Atlas → Database Access.
