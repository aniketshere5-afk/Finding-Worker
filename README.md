# Finding Worker 🔧

A full-stack platform connecting customers with skilled workers (electricians, plumbers, carpenters, painters, mechanics, and more). Customers can search, book, review, and manage worker services through a modern UI with Google OAuth authentication.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 7, React Router 7 |
| **Backend** | Spring Boot 4.1, Spring Security, Spring Data JPA |
| **Database** | MySQL |
| **Auth** | Google OAuth 2.0 (OIDC) with CSRF cookie-based sessions |
| **Deployment** | Vercel (frontend), Render (backend) |

## Project Structure

```
finding-worker/
├── frontend/                 # React/Vite frontend
│   ├── src/
│   │   ├── api/              # API client (demo + real mode)
│   │   ├── components/       # Layout, Protected routes, etc.
│   │   ├── context/          # Auth context (Google OAuth)
│   │   ├── pages/            # All pages (Home, Workers, Book, etc.)
│   │   └── styles.css        # Global styles
│   ├── vercel.json           # Vercel deployment config
│   └── vite.config.js        # Dev server + API proxy config
│
├── finding-worker-release/   # Spring Boot backend
│   ├── src/main/java/com/findingworker/
│   │   ├── config/           # Security config (CORS, CSRF, OAuth2)
│   │   ├── controller/       # REST controllers
│   │   ├── entity/           # JPA entities
│   │   ├── repository/       # Spring Data repositories
│   │   ├── security/         # OAuth2 user service + success handler
│   │   └── service/          # Business logic
│   ├── Dockerfile            # Multi-stage Docker build
│   └── .env.example          # Required environment variables
└── README.md
```

## Quick Start

### Frontend (Demo Mode — No Backend Required)

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173 with mock data
```

### Frontend + Backend (Full Stack)

**1. Set up MySQL database:**
```sql
CREATE DATABASE finding_worker;
```

**2. Configure backend environment variables:**
```bash
cd finding-worker-release
cp .env.example .env
# Edit .env with your DB credentials and Google OAuth keys
```

**3. Start the backend:**
```bash
./mvnw spring-boot:run
# Runs at http://localhost:8080
```

**4. Start the frontend (connected to backend):**
```bash
cd frontend
cp .env.example .env
# Edit .env: set VITE_DEMO_MODE=false
npm install
npm run dev
```

## Features

- 🔐 **Google OAuth 2.0** login
- 🔍 **Search workers** by city, category, experience, hourly rate
- 📅 **Book services** with date, address, and description
- ⭐ **Rate & review** workers
- 🛠️ **Worker dashboard** to manage availability and profile
- 👑 **Admin panel** for user/worker management
- 📱 **Responsive** design

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile/me` | Current user profile |
| POST | `/api/profile/complete` | Complete new user profile |
| GET | `/api/worker-profiles/search-workers` | Search workers with filters |
| POST | `/create-booking` | Create a new booking |
| GET | `/get-bookings-by-customer-id/{id}` | Customer's bookings |
| POST | `/create-review` | Submit a review |
| GET | `/get-all-categories` | All service categories |

## Environment Variables

### Backend (`finding-worker-release/.env`)
| Variable | Description |
|----------|-------------|
| `DB_URL` | MySQL JDBC URL |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `FRONTEND_URL` | Frontend URL for CORS (e.g., `https://your-app.vercel.app`) |
| `SESSION_COOKIE_SAME_SITE` | `none` for cross-site deployment |
| `SESSION_COOKIE_SECURE` | `true` for HTTPS deployment |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_DEMO_MODE` | `true` for mock data, `false` for real backend |
| `VITE_API_URL` | Backend URL (e.g., `https://your-backend.onrender.com`) |

## Deployment

### Frontend → Vercel
1. Import the `frontend/` directory on [Vercel](https://vercel.com)
2. Set environment variables: `VITE_DEMO_MODE=false`, `VITE_API_URL=<backend-url>`
3. Framework preset: Vite

### Backend → Render
1. Create a new **Web Service** on [Render](https://render.com)
2. Point to `finding-worker-release/` with Docker
3. Set all required environment variables
4. Add a MySQL database (or use external provider)

## License

MIT
