# Local Services Marketplace

A full-stack web application that connects local service providers with customers in their area. Providers can list services such as plumbing, electrical work, tutoring, cleaning, and mechanical repair. Customers can browse listings, request services, track booking status, and communicate directly with providers through a real-time messaging system.

The project is currently in active development at the MVP stage. Core functionality is complete and operational.

---

## Project Structure

```
local-services-marketplace/
├── frontend/          React application (Vite)
├── backend/           Node.js REST API and Socket.IO server
└── README.md
```

---

## Features

**Service Marketplace**
- Browse and search services by keyword, category, and location
- Detailed service listings with images, pricing, and provider information
- Featured services section on the home page

**Booking and Requests**
- Customers submit service requests directly from listings
- Providers can accept, reject, or mark requests as complete
- Full request lifecycle tracking: Pending, Accepted, Completed, Rejected, Cancelled

**User Profiles**
- Customizable profiles with avatar, bio, contact info, social links, and location
- Email verification via OTP
- Dark mode and light mode support

**Messaging**
- Real-time direct messaging between users via Socket.IO
- Conversation list with unread message counts
- REST fallback for environments where WebSocket connections are unavailable

**Admin Console**
- Marketplace overview with live KPI cards (users, services, requests, completion rate)
- User management: view profiles, change roles, delete accounts
- Service moderation: view and delete listings
- Category management: create, edit, and delete categories
- Report review: resolve or dismiss flagged content

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router v7 |
| Styling | Vanilla CSS with custom design tokens, dark/light mode |
| Real-time | Socket.IO client |
| Auth (client) | Google OAuth via @react-oauth/google |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL with pg pool |
| Auth (server) | JWT (jsonwebtoken), bcrypt, Google Auth Library |
| File uploads | Multer |
| Email | Nodemailer |
| Real-time | Socket.IO |

---

## Prerequisites

- Node.js v18 or higher
- PostgreSQL v14 or higher
- Git

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/local-services-marketplace.git
cd local-services-marketplace
```

### 2. Set up the database

Create a PostgreSQL database named `local_services_marketplace` and run the schema file:

```bash
psql -U postgres -d local_services_marketplace -f backend/src/db/schema.sql
```

### 3. Configure and start the backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials and other settings
npm run dev
```

The API server starts on `http://localhost:5000`.

### 4. Start the frontend

```bash
cd ../frontend
npm install
npm run dev
```

The app is available at `http://localhost:5173`.

---

## Environment Variables

See `backend/.env.example` for all required backend variables. The frontend reads `VITE_GOOGLE_CLIENT_ID` from a `.env` file in the `frontend/` directory if you want to configure Google OAuth with your own credentials.

---

## Roadmap

- Payment gateway integration
- Customer reviews and ratings
- Push notifications
- Map-based service discovery
