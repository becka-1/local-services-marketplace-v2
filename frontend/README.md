# Frontend

React application for the Local Services Marketplace, built with Vite. Provides the user interface for browsing services, managing bookings, messaging, user profiles, and the admin console.

---

## Tech Stack

| Dependency | Purpose |
|---|---|
| React 19 | UI component library |
| Vite 8 | Build tool and development server |
| React Router v7 | Client-side routing |
| Axios | HTTP requests to the backend API |
| Socket.IO client | Real-time messaging connection |
| @react-oauth/google | Google Sign-In button and token handling |
| Framer Motion | Animation primitives |
| Vanilla CSS | All styling via custom CSS with design token variables |

---

## Project Structure

```
frontend/
├── public/
│   └── default-service-images/   Stock images selectable when creating a service
├── src/
│   ├── main.jsx                  App entry point, providers, BrowserRouter
│   ├── App.jsx                   Route definitions
│   ├── index.css                 Global styles, CSS variables, dark mode tokens, typography
│   ├── App.css                   App-level layout styles
│   ├── assets/
│   │   └── fonts/                Self-hosted Ubuntu and Nunito Sans fonts
│   ├── context/
│   │   ├── UserContext.jsx       Authenticated user state, login/logout helpers
│   │   └── ThemeContext.jsx      Dark/light mode toggle and persistence
│   ├── pages/
│   │   ├── Home.jsx / Home.css               Landing page with featured services
│   │   ├── Services.jsx / Services.css       Service catalog with search and category filter
│   │   ├── UserProfile.jsx / UserProfile.css Profile view and edit, social links, services list
│   │   ├── CreateService.jsx                 Multi-step service creation form with image upload
│   │   ├── MyRequests.jsx                    Sent and received requests dashboard
│   │   ├── RequestDetails.jsx                Single request view with status controls
│   │   ├── EditRequest.jsx                   Edit a pending request message
│   │   ├── Messages.jsx / Messages.css       Real-time conversation UI with message history
│   │   ├── AdminDashboard.jsx                Admin layout with sidebar navigation
│   │   └── admin/
│   │       ├── StatsTab.jsx       Overview KPIs, fulfillment analytics, quick navigation
│   │       ├── UsersTab.jsx       User table with role management and deletion
│   │       ├── ServicesTab.jsx    Service table with view, edit, delete
│   │       ├── RequestsTab.jsx    Request table with delete
│   │       ├── CategoriesTab.jsx  Category create, edit, delete
│   │       └── ReportsTab.jsx     Report review with resolve and dismiss actions
│   ├── components/
│   │   ├── Navbar.jsx / Navbar.css              Top navigation bar, auth modals trigger, theme toggle
│   │   ├── Footer.jsx / Footer.css              Site footer
│   │   ├── LoginModal.jsx                       Email/password and Google login form
│   │   ├── SignupModal.jsx                      Registration form (name, email, phone, password)
│   │   ├── VerificationModal.jsx                OTP entry modal after registration
│   │   ├── ServiceCard.jsx / ServiceCard.css    Reusable service listing card
│   │   ├── ServiceDetailsModal.jsx              Full service details in a modal overlay
│   │   ├── EditServiceModal.jsx                 Service edit form with image management
│   │   ├── ServiceGallery.jsx                   Image gallery for service listings
│   │   ├── ServiceImage.jsx                     Single image fetched from the API
│   │   ├── RequestServiceModal.jsx              Request submission form
│   │   ├── ImageCropperModal.jsx                Profile picture crop and resize tool
│   │   ├── ProfileAvatar.jsx                    Avatar component with fallback initials
│   │   ├── ThemeToggle.jsx                      Dark/light mode toggle button
│   │   ├── HamburgerToggle.jsx                  Mobile nav toggle button
│   │   ├── ProtectedRoute.jsx                   Redirects unauthenticated users to home
│   │   └── AdminRoute.jsx                       Redirects non-admin users to home
│   └── services/
│       ├── api.js                Base Axios instance with credentials and base URL
│       ├── authApi.js            Login, register, logout, getMe
│       ├── profileApi.js         Profile read/write, picture upload/delete, social links, verification
│       ├── serviceApi.js         Service CRUD, image operations
│       ├── requestApi.js         Request creation, status update, deletion
│       ├── adminApi.js           Admin stats, user/service/request/category/report endpoints
│       ├── categoryApi.js        Category listing
│       ├── conversationApi.js    Conversation creation, message history
│       ├── userApi.js            Public user lookup
│       └── socket.js             Socket.IO client singleton
├── index.html
└── package.json
```

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables (optional)

Create a `.env` file in the `frontend/` directory if you want to use your own Google OAuth credentials:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

If not set, a default development client ID is used as a fallback.

### 3. Start the development server

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

To expose the dev server on the local network (useful for testing on other devices):

```bash
npm run dev -- --host
```

### 4. Build for production

```bash
npm run build
```

Output is written to `dist/`. Serve it with any static file host or preview locally with:

```bash
npm run preview
```

---

## Design System

All styles are written in vanilla CSS using custom properties defined in `index.css`. No utility-class framework is used.

Key design tokens:

| Variable | Role |
|---|---|
| `--color-base` | Page background |
| `--color-surface` | Card and panel backgrounds |
| `--color-surface-muted` | Input fields, secondary backgrounds |
| `--color-primary` | Primary action color (links, buttons, accents) |
| `--color-light-blue` | Borders and subtle highlights |
| `--color-text` | Primary text |
| `--color-text-muted` | Secondary and label text |
| `--color-accent-yellow` | Warning and pending states |
| `--color-accent-orange` | Destructive actions and error states |

Dark mode is applied by toggling the `dark` class on the `html` element. All token values are overridden in the `html.dark` selector, so no component-level changes are needed for theme support.

Typography uses two self-hosted fonts: Ubuntu (headings) and Nunito Sans (body). Fluid type scale variables (`--fs-h1` through `--fs-small`) use `clamp()` for responsive scaling without breakpoints.

---

## Routing

| Path | Component | Access |
|---|---|---|
| `/` | Home | Public |
| `/services` | Services | Public |
| `/users/:id` | UserProfile | Public |
| `/services/new` | CreateService | Authenticated |
| `/users/:id/requests` | MyRequests | Authenticated |
| `/requests/:id` | RequestDetails | Authenticated |
| `/requests/:id/edit` | EditRequest | Authenticated |
| `/messages` | Messages | Authenticated |
| `/admin` | AdminDashboard | Admin only |
