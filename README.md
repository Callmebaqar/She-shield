# SheShield 🛡️ — Women's Safety Platform

A full-stack women's safety web platform with **SOS emergency alerts**, **panic/emergency contacts**, **safety reporting**, and **help & resources** — targeting **Pakistan** (default emergency number **1122** / Rescue 1122).

- **Frontend**: React + TypeScript + Vite + Tailwind CSS (dark mode, fully responsive)
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL (production / VPS), SQLite (local dev fallback)
- **Auth**: JWT + bcryptjs password hashing, sessions tracked in DB

> NOTE: SOS issues an emergency **alert recorded in the database** and provides **WhatsApp / tel: links** to reach Rescue 1122 (`1122`) and Police (`15`). It does **not** claim to auto-dispatch SMS/calls to emergency services.

---

## Folder Layout

```
SheShield/
├── backend/            # Express + TypeScript REST API + Prisma
│   ├── prisma/
│   │   ├── schema.prisma          # ACTIVE schema (SQLite in dev / Postgres in prod)
│   │   ├── schema.dev.prisma      # SQLite dev schema
│   │   ├── schema.postgres.prisma # PostgreSQL production schema
│   │   └── seed.ts                # Seed users: admin@sheshield.app / demo@sheshield.app (Admin@1234)
│   ├── scripts/use-sqlite.js      # Swap to SQLite schema
│   ├── scripts/use-postgres.js    # Swap to PostgreSQL schema
│   ├── src/
│   │   ├── index.ts          # Express app wiring
│   │   ├── middleware/       # auth (JWT + DB session), rateLimit
│   │   ├── modules/          # auth, users, contacts, alerts, reports, admin, config
│   │   └── utils/            # config, prisma, hash (bcrypt), token, errors, activity, constants
│   └── ecosystem.config.cjs  # PM2 config for VPS
└── frontend/           # React + Vite + Tailwind SPA
    └── src/
        ├── components/   # Layout (public+app shell), ui kit, ProtectedRoute
        ├── context/      # Auth, Theme (dark mode)
        ├── data/content.ts  # Stay-safe tips, how-it-works, resources, helplines
        ├── lib/          # api (fetch wrapper), types, geo (geolocation)
        └── pages/        # Home, Login, Register, Forgot/Reset, Dashboard, SOS,
                          # Contacts, Alerts, Reports, Resources, Profile, Settings, Admin
```

---

## Getting Started (Local Development)

### Requirements
- Node.js v20+ (tested on Node v24)
- npm 10+

### 1. Backend

```bash
cd backend
npm install

# Use SQLite schema (local dev default) + create DB + seed
npm run db:sqlite-setup
npm run seed

# Copy env and keep SQLite defaults
copy .env.example .env   # on Windows (or: cp .env.example .env)

# Run the API (http://localhost:4000)
npm run dev
```

Health check: `curl http://localhost:4000/api/health`

### 2. Frontend

```bash
cd frontend
npm install

# Dev server at http://localhost:5173 (Vite proxies /api -> localhost:4000)
npm run dev
```

Open **http://localhost:5173**.

> Use `npm run build` to produce a production bundle in `frontend/dist`.

---

## Using PostgreSQL (Production / VPS)

1. Install PostgreSQL on the server:
   ```bash
   sudo apt update && sudo apt install -y postgresql postgresql-contrib
   sudo -u postgres psql -c "CREATE DATABASE sheshield;"
   sudo -u postgres psql -c "CREATE USER sheshield WITH PASSWORD 'choose-a-strong-password';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sheshield TO sheshield;"
   ```

2. In `backend/.env`:
   ```env
   DATABASE_URL="postgresql://sheshield:PASSWORD@localhost:5432/sheshield?schema=public"
   NODE_ENV="production"
   CLIENT_ORIGIN="https://yourdomain.com"
   FRONTEND_URL="https://yourdomain.com"
   ```

3. Swap to the Postgres schema and deploy migrations:
   ```bash
   npm run use:postgres
   npx prisma db push      # or: npx prisma migrate deploy
   npx prisma generate
   npm run seed
   ```

---

## Deployment to a VPS (Node + Postgres + reverse proxy)

Example for Ubuntu with a domain like `sheshield.example.com`.

### 1. Backend (API)

```bash
git clone <your-repo-url> && cd SheShield/backend
npm install
npm run build                # compiles TypeScript -> dist/
npm run use:postgres
npx prisma db push && npx prisma generate
npm run seed

# Process manager (PM2)
npm i -g pm2
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup
```

### 2. Frontend (built + served)

```bash
cd ../frontend
npm install
npm run build      # produces frontend/dist
```

Two options to serve the SPA:
- **A) Serve from the API** — copy `frontend/dist` and have the backend (or Nginx) serve the static files and the API under the same domain.
- **B) Serve separately** and point the built frontend at the API with `VITE_API_URL`:
  ```bash
  # frontend/.env.local
  VITE_API_URL=https://api.sheshield.example.com/api
  ```

### 3. Nginx reverse proxy (HTTPS)

Example `/etc/nginx/sites-available/sheshield`:

```nginx
server {
    listen 80;
    server_name sheshield.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sheshield.example.com;

    # SSL: use certbot (or your provider's cert)
    ssl_certificate     /etc/letsencrypt/live/sheshield.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sheshield.example.com/privkey.pem;

    root /var/www/sheshield/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback so client-side routes work on refresh
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/sheshield /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Enable HTTPS: `sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx -d sheshield.example.com`

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Prisma connection string (SQLite `file:./dev.db` or PostgreSQL) |
| `JWT_SECRET` | Long random string. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `PORT` | API port (default `4000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_ORIGIN` | Allowed CORS origin(s), comma-separated |
| `FRONTEND_URL` | Frontend base URL (used in emails) |
| `EMAIL_PROVIDER` | `dev` (logs reset links) or your provider name |
| `RESEND_API_KEY` | Optional email provider API key |

### Frontend (`frontend/.env.local` — optional)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API origin. In dev the Vite proxy handles `/api`, so not required. |

---

## API Overview

All routes are prefixed with `/api`.

**Public**
- `GET /api/health` — health check
- `GET /api/config` — app name, WhatsApp number, emergency numbers list

**Auth**
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — login (JWT + DB session)
- `POST /api/auth/logout` — invalidate session
- `GET /api/auth/me` — current user
- `POST /api/auth/forgot-password` — request reset
- `POST /api/auth/reset-password` — reset with token
- `PATCH /api/auth/change-password` — change password (authed)

**Users (authed)**
- `PATCH /api/users/me` — update profile
- `DELETE /api/users/me` — delete account

**Emergency contacts (authed, max 5)**
- `GET/POST /api/emergency-contacts`
- `PATCH/DELETE /api/emergency-contacts/:id`

**Alerts / SOS (authed)**
- `GET /api/alerts` — history
- `GET /api/alerts/active` — active alert (if any)
- `POST /api/alerts` — create SOS alert (optional lat/long, note)
- `PATCH /api/alerts/:id` — resolve/cancel

**Reports (authed)**
- `GET/POST /api/reports`

**Admin (role: ADMIN)**
- `GET /api/admin/stats` — dashboard stats
- `GET /api/admin/users` — list users (with alert/report counts)
- `PATCH /api/admin/users/:id` — toggle active / role
- `GET /api/admin/reports` — all reports
- `PATCH /api/admin/reports/:id` — update status / add admin note
- `GET /api/admin/alerts` — all alerts

---

## Seed Accounts

Seeded by `npm run seed`:

| Role  | Email                 | Password     |
|-------|-----------------------|--------------|
| Admin | `admin@sheshield.app` | `Admin@1234` |
| Demo  | `demo@sheshield.app`  | `Admin@1234` |

---

## Security Notes

- **Passwords**: hashed with `bcryptjs` (never stored in plain text).
- **Sessions**: JWTs are short-lived and tied to DB session records; logout/revoke invalidates the token server-side.
- **Authz**: `/api/admin/*` is guarded by an `adminOnly` middleware → returns `403` for non-admin users.
- **Rate limiting**: global `express-rate-limit` on `/api`.
- **Headers**: `helmet()` sets secure HTTP headers; `cors` restricts the client origin (configurable).
- **Input validation**: request bodies validated with `zod`.
- **Env separation**: real credentials live in `.env` (gitignored); `.env.example` is committed.

---

## Privacy

- Location sharing in SOS/Reports is **opt-in** (browser prompt), and the user can cancel/deny.
- The UI clearly explains privacy, and reports can be made with or without a location.

---

## GitHub Pages (static demo only)

The repo also contains the original static `index.html` deployable via GitHub Pages
(`https://callmebaqar.github.io/She-shield/`). This is a **static demo only** — it has no
backend. The full-stack version requires the VPS deployment described above.
