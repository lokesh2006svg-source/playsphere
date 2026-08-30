# 🏆 PlaySphere — Unified Sports Community Platform

> **Live Deployment Links:**
> - 🌐 **Frontend Web App (Vercel)**: [https://playsphere-eight.vercel.app](https://playsphere-eight.vercel.app)
> - 🚀 **Backend REST API (Render)**: [https://playsphere-zo9o.onrender.com](https://playsphere-zo9o.onrender.com)
> - 🏥 **Live Health Status Probe**: [https://playsphere-zo9o.onrender.com/api/health](https://playsphere-zo9o.onrender.com/api/health)
> - 📦 **GitHub Source Repository**: [https://github.com/lokesh2006svg-source/playsphere](https://github.com/lokesh2006svg-source/playsphere)
>
> **Super Admin Credentials**: `demo@playsphere.com` / `password123`

**PlaySphere** is a production-ready, full-stack sports community platform designed for athletes, club managers, venue owners, and sports federations. It centralizes player discovery, court/turf reservations, tournament knockout leagues with visual brackets, real-time live scoring with embedded YouTube broadcasts, an AI rules referee with speech recognition, and verified governing sports bodies across 33+ sports with localized Tamil Nadu data (Chennai, Coimbatore, Madurai, Trichy, Salem).

---

## 🚀 Key Feature Highlights

### 1. 🛡️ Authentication & Digital Player Profiles (Phase 1)
- **JWT & bcrypt Security**: Robust authentication with persistent session management.
- **Onboarding Pipeline**: Seamless flow enforcing profile setup before arena entry.
- **Digital Sports Pass (`PlayerIdCard.jsx`)**: Holographic athlete membership pass with unique ID (`PS-2026-00001`), QR verification code, verified badge holograms, and **1-click PNG image export** via `html2canvas`.
- **Public Shareable Profiles**: Standalone route (`/profile/public/:userId`) accessible without login.

### 2. ⚡ 33+ Sports Taxonomy & Reusable Selector (Phase 2)
- Categorized taxonomy across 6 sports categories: *Team Sports, Racquet Sports, Combat Sports, Individual Sports, Indoor Games, Traditional Sports (Silambam)*.
- Reusable `SportSelector.jsx` dropdown with category headers, emojis, and styling.

### 3. 📍 Geospatial Nearby Player Discovery (Phase 3)
- **MongoDB `$geoNear` Pipeline**: Proximity calculations with custom kilometer radius slider (1 - 50 km).
- **Browser Geolocation API**: 1-click GPS detection with intelligent city-based fallback when offline.

### 4. 🏟️ Court & Venue Booking Engine (Phase 4)
- **Slot Availability Engine**: 1-hour slot grid checking real-time conflicts and preventing overlapping bookings.
- **Facility Amenities & Pricing**: Real-time total calculation, Google Maps links, and user booking history with refund status.

### 5. 🏆 Teams, Tournaments & Visual Bracket Engine (Phase 5)
- **Squad Management**: Roster creation, captaincy designations, and invite workflows.
- **Knockout Bracket Generator**: Automated match fixture generation (`/generate-bracket`) with randomized/seeded team pairing.
- **Visual Bracket View**: Column-based round progression (*Round 1 / Quarterfinals → Semifinals → Finals*) with live score tags.

### 6. 📡 Real-Time Live Scores, YouTube Streaming & AI Rules Chatbot (Phase 6)
- **WebSocket Rooms (`Socket.io`)**: Instant live score broadcasts to match rooms (`match_<id>`).
- **Strict Scorer Authorization**: Only assigned referees/organizers can edit live scores, commentary, or statuses.
- **Embedded YouTube Video Streams**: Automatic video ID extraction from watch/live/short links with validation.
- **RAG-based AI Sports Referee**: Smart retriever matching official rulebooks with **Web Speech API voice-to-text input (SpeechRecognition)** and **voice speech synthesis output**.

### 7. 🏛️ Official Sports Bodies, Clubs & Referral Invites (Phase 7)
- **Hierarchical Tree View**: Tamil Nadu governing associations (*TNCA, TNFA, TNKA, TNBA, TNSA*) with district associations.
- **Shareable Referrals**: Dynamic referral codes (`/join/:inviteCode`) with pre-filled sport and city onboarding.
- **In-App Notification Center**: Real-time alerts for booking confirmations, team invites, and tournament registrations.

### 8. ⚙️ Automation, Daily Cron Sync & Single-Service Deployment (Phase 8)
- **n8n Webhook Notifier (`webhookNotifier.js`)**: Non-blocking asynchronous triggers for bookings, team invites, and live matches.
- **Automated Daily Cron (`jobs/dailySync.js`)**: 6:00 AM IST scheduled cleaner for stale matches and cache refresh.
- **Automated MongoDB Fallback**: Seamless development with `mongodb-memory-server` if local MongoDB is not running.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Socket.io-client, Lucide Icons, html2canvas, canvas-confetti |
| **Backend** | Node.js (ESM), Express.js, MongoDB (Mongoose), JWT, bcryptjs, Socket.io, node-cron, dotenv, cors |
| **Database** | MongoDB with `2dsphere` geospatial indexing + automated `mongodb-memory-server` fallback |
| **AI / Voice** | RAG Rule Retriever + Web Speech API (SpeechRecognition & SpeechSynthesis) + LLM Connector |

---

## 📁 Repository Structure

```
playsphere/
├── backend/
│   ├── config/             # Database connection & memory fallback
│   ├── constants/          # 34 Sports list & category definitions
│   ├── controllers/        # Controllers for Auth, Profile, Venues, Teams, Tournaments, Matches, etc.
│   ├── jobs/               # Daily cron sync routine (node-cron)
│   ├── middleware/         # JWT protect & optionalProtect middleware
│   ├── models/             # Mongoose schemas (User, Profile, Venue, Booking, Team, Tournament, Match, GameRule, etc.)
│   ├── routes/             # Express API routes
│   ├── utils/              # Seed script, YouTube helper, n8n webhook notifier
│   ├── .env.example        # Backend environment template
│   └── server.js           # Server entry point & WebSocket handlers
│
└── frontend/
    ├── src/
    │   ├── api.js          # Central Axios client & API endpoints
    │   ├── context/        # AuthContext & SportsContext
    │   ├── components/     # Navbar, Footer, PlayerIdCard, SportSelector, ChatbotWidget, etc.
    │   ├── pages/          # Dashboard, Venues, Teams, Tournaments, LiveMatches, MatchLive, GameRules, etc.
    │   ├── App.jsx         # React Router configuration
    │   └── index.css       # Tailwind & glassmorphism tokens
    ├── tailwind.config.js  # Color tokens & animations
    └── vite.config.js      # Vite build configuration
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **npm**: v9+

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev        # Starts API on http://localhost:5000
```
> *Note:* If MongoDB is not running locally, PlaySphere will automatically launch an in-memory MongoDB instance and seed realistic Tamil Nadu data.

### 3. Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev        # Starts Vite dev server on http://localhost:5173
```

### 4. Default Demo Accounts
| Role | Email | Password |
|---|---|---|
| **Admin / Captain** | `demo@playsphere.com` | `password123` |
| **Athlete** | `ananya@playsphere.com` | `password123` |
| **Footballer** | `karthik@playsphere.com` | `password123` |

---

## ☁️ Single-Service Deployment Guide (Render)

PlaySphere is architected for unified single-service deployment where Express serves the compiled React Vite frontend static bundle (`frontend/dist`) along with the API and WebSockets.

### Render Deployment Steps:
1. Push this repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** → **Web Service**.
3. Connect your repository.
4. Set the following Build & Start commands:
   - **Root Directory**: leave blank (or `./`)
   - **Build Command**:
     ```bash
     cd frontend && npm install && npm run build && cd ../backend && npm install
     ```
   - **Start Command**:
     ```bash
     cd backend && node server.js
     ```
5. Configure Environment Variables in Render:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (or leave default Render port)
   - `MONGO_URI` = `mongodb+srv://<user>:<password>@cluster.mongodb.net/playsphere` (MongoDB Atlas URI)
   - `JWT_SECRET` = `your_super_secret_jwt_key`
   - `N8N_WEBHOOK_URL` = `(optional)`
   - `LLM_API_KEY` = `(optional)`

---

## 📜 API Reference Summary

- `POST /api/auth/register` — Create account with email, password, city
- `POST /api/auth/login` — Login & receive JWT token
- `GET /api/profile/:userId/card` — Digital sports ID card payload
- `GET /api/sports` — 33+ sports grouped by category
- `GET /api/players/nearby` — Geospatial radius search with distance calculation
- `GET /api/venues` — Search sports grounds with slot availability
- `POST /api/bookings` — Reserve court slot with overlap validation
- `POST /api/tournaments/:id/generate-bracket` — Knockout bracket generator
- `PUT /api/matches/:id/score` — Real-time score update (Scorer authorized only)
- `POST /api/chatbot/ask` — RAG-based sports rules AI query

---

## 🔒 Security Notes & Safeguards

PlaySphere incorporates defense-in-depth security safeguards designed to protect athlete data and clearly isolate simulation components:

### 1. ⚠️ Simulated Payment Flow Disclaimer
- The UPI QR payment engine is a **demo and simulation feature** intended for academic/portfolio demonstration.
- **Do not send real money**: The system generates standard NPCI-compliant UPI payment URIs for presentation, but does **not** process real banking transactions.
- **Production Requirement**: A production deployment must replace this simulation with a certified payment gateway (e.g. **Razorpay, PayU, Cashfree**) utilizing cryptographic webhook verification signatures before marking bookings as paid.

### 2. 🛡️ Rate Limiting & Abuse Prevention (`express-rate-limit`)
- **Login Endpoint (`POST /api/auth/login`)**: Throttled to **5 attempts per 15 minutes per IP** to prevent brute-force attacks and credential stuffing.
- **Registration Endpoint (`POST /api/auth/register`)**: Limited to **3 account registrations per hour per IP** to eliminate bot account creation.
- **Payment Confirmation (`POST /api/bookings/:id/confirm-payment`)**: Capped at **3 confirmation attempts per booking ID** alongside per-IP rate limiting to prevent confirmation abuse.
- **Global API Limiter**: Enforces a 300 requests per 15 minutes per IP baseline.

### 3. 🧹 Input Validation & XSS Sanitization (`express-validator`)
- All user-submitted text fields (`bio`, `team name`, `venue name`, `rules`, etc.) are validated with `express-validator` and sanitized recursively to strip dangerous `<script>`, `<iframe>`, and `javascript:` injection payloads before storage and rendering.

### 4. 🔏 Data Privacy & Secret Isolation
- **Venue Owner Data Protection**: Venue `ownerContact` details (personal phone/email) are **strictly stripped** from public venue listings (`GET /api/venues` & `GET /api/venues/:id`). Only authorized venue administrators and super admins can view owner contact details.
- **Secret & Password Isolation**: Passwords and 6-digit OTP verification codes are hashed using `bcryptjs` and automatically excluded from all API responses via Mongoose `toJSON` transforms.
- **JWT Session Lifespans**: Authentication tokens are configured with a secure **7-day expiry** (`expiresIn: "7d"`).

### 5. 📜 Security Audit Logging (`AuditLog`)
- High-privilege actions (user role alterations, venue deletions/creations, match removals, and booking payment confirmations) are permanently recorded in the `AuditLog` collection with actor ID, IP address, timestamp, and metadata for auditability.

### 6. 🚀 Production Hardening Recommendations
Before deploying to a public production domain:
1. **HTTPS Enforcement**: Terminate SSL/TLS at reverse proxy (Cloudflare, Nginx, or Render).
2. **Helmet.js Security Headers**: HTTP headers (`X-Content-Type-Options`, `Strict-Transport-Security`, `X-Frame-Options`) are initialized in `server.js`.
3. **CSRF Tokens**: Recommended if transitioning session storage from Bearer JWT to HttpOnly cookies.

---

Built with ❤️ for the Tamil Nadu and Indian sports community.
