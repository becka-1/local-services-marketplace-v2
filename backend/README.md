# Backend

Node.js and Express REST API server for the Local Services Marketplace. Handles authentication, data management, file uploads, email delivery, and real-time messaging via Socket.IO.

---

## Tech Stack

| Dependency | Purpose |
|---|---|
| Express 5 | HTTP server and routing |
| PostgreSQL / pg | Relational database and connection pooling |
| jsonwebtoken | JWT-based session authentication |
| bcrypt | Password hashing |
| Google Auth Library | Google OAuth token verification |
| Multer | Multipart file upload handling (profile pictures, service images) |
| Socket.IO | Real-time bidirectional messaging |
| Nodemailer | Transactional email (OTP delivery) |
| cookie-parser | HTTP-only cookie parsing |
| dotenv | Environment variable loading |
| nodemon | Development auto-reload |

---

## Project Structure

```
backend/
├── src/
│   ├── app.js                    Entry point: Express setup, middleware, Socket.IO, route mounting
│   ├── db/
│   │   ├── db.js                 PostgreSQL connection pool
│   │   └── schema.sql            Full database schema
│   ├── controllers/
│   │   ├── authController.js     Registration (OTP flow), login, logout, Google OAuth, getMe
│   │   ├── profileController.js  Profile CRUD, profile picture, social links, email verification
│   │   ├── serviceController.js  Service CRUD, image upload/retrieval, featured services
│   │   ├── requestController.js  Service request lifecycle management
│   │   ├── conversationController.js  Conversations and paginated message history
│   │   ├── adminController.js    Admin stats, user/service/request/category/report management
│   │   ├── categoryController.js Public category listing
│   │   └── userController.js     Public user lookup
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── conversationRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js     JWT verification (verifyToken) and admin guard (isAdmin)
│   │   └── updload.js            Multer configuration (memory storage, 5 MB limit)
│   ├── services/
│   │   └── emailService.js       Nodemailer transporter and OTP email template
│   └── socket/
│       └── socketHandler.js      Socket.IO event handlers (join rooms, send message, read receipt)
├── .env.example                  Environment variable template
└── package.json
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=local_services_marketplace
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key
```

Additional optional variables used by the email and Google OAuth services can be found in `.env.example`.

### 3. Set up the database

Create the database and apply the schema:

```bash
psql -U postgres -c "CREATE DATABASE local_services_marketplace;"
psql -U postgres -d local_services_marketplace -f src/db/schema.sql
```

### 4. Start the server

Development (with auto-reload):

```bash
npm run dev
```

Production:

```bash
npm start
```

The server runs on the port defined by `PORT` (default `5000`).

---

## API Overview

All routes are prefixed with `/api`.

| Prefix | Description |
|---|---|
| `/api/auth` | Register (OTP), confirm, login, Google login, logout, getMe |
| `/api/profiles/:id` | Profile read/write, profile picture, social links, email verification |
| `/api/services` | Service CRUD, image upload and retrieval, featured services |
| `/api/requests` | Service request creation, status updates, deletion |
| `/api/conversations` | Conversation creation, message history, send message (REST fallback) |
| `/api/categories` | Public category listing |
| `/api/users` | Public user lookup |
| `/api/admin` | Admin-only: stats, user management, service/request management, category and report management |
| `/api/health` | Health check returning server time and database connectivity status |

---

## Authentication

- On login or registration, the server issues a signed JWT stored in an HTTP-only cookie (`token`, 7-day expiry).
- The `verifyToken` middleware reads and verifies this cookie on protected routes.
- The `isAdmin` middleware additionally checks that the verified user has the `admin` role.
- Google OAuth is supported through the `/api/auth/google` endpoint. The client sends a Google ID token; the server verifies it, creates or links the account, and issues a session cookie.

---

## Database Schema

Core tables:

| Table | Description |
|---|---|
| `users` | Account credentials, role, Google ID |
| `profiles` | Name, bio, phone, email, location, website, profile picture, verification flags |
| `profile_social_links` | Per-user social platform links |
| `categories` | Service categories |
| `services` | Service listings linked to a user and category |
| `service_images` | Binary image data for service listings (up to 5 per service) |
| `service_requests` | Booking requests from customers to providers |
| `conversations` | Unique user pairs for direct messaging |
| `messages` | Individual messages within conversations |
| `reports` | User-submitted flags on services or users |
