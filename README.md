# 🍽️ Naija Bites — Full-Stack Nigerian Restaurant Platform

A complete, production-quality full-stack Nigerian restaurant ordering website.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |

---

## Project Structure

```
naija-bites/
├── client/              # React/Vite frontend
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── context/     # AuthContext, CartContext
│       ├── pages/       # All route pages
│       ├── routes/      # ProtectedRoute, AdminRoute
│       ├── services/    # Axios API service
│       ├── layouts/     # MainLayout
│       └── utils/       # Helpers (formatPrice, etc.)
└── server/              # Express backend
    └── src/
        ├── config/      # Database pool config
        ├── controllers/ # Business logic
        ├── db/          # Migrations + seed data
        ├── middleware/  # Auth + validation
        ├── routes/      # Express routers
        └── utils/       # JWT + response helpers
```

---

## Quick Start

### 1. Prerequisites

- Node.js v18+
- PostgreSQL 13+

### 2. PostgreSQL Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE naija_bites;"
```

### 3. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env — set DB_USER, DB_PASSWORD, etc.

# Run database migrations (creates all tables)
npm run db:migrate

# Seed database (creates menu items + admin/demo accounts)
npm run db:seed

# Start development server
npm run dev
```

Backend runs at: `http://localhost:5000`

### 4. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Demo Accounts

| Role | Email | Password |
|------|-------|---------|
| Admin | admin@naijabites.com | Admin@12345 |
| Customer | customer@naijabites.com | User@12345 |

---

## API Endpoints

### Authentication
```
POST   /api/auth/register   — Register new customer account
POST   /api/auth/login      — Login
GET    /api/auth/me         — Get current user (auth required)
PUT    /api/auth/profile    — Update profile (auth required)
```

### Menu
```
GET    /api/menu            — Get all menu items (supports ?category=, ?search=, ?available=)
GET    /api/menu/:id        — Get single menu item
POST   /api/menu            — Create menu item (admin only)
PUT    /api/menu/:id        — Update menu item (admin only)
DELETE /api/menu/:id        — Delete menu item (admin only)
```

### Categories
```
GET    /api/categories      — Get all categories
POST   /api/categories      — Create category (admin only)
PUT    /api/categories/:id  — Update category (admin only)
DELETE /api/categories/:id  — Delete category (admin only)
```

### Orders
```
POST   /api/orders                     — Place order (auth required)
GET    /api/orders                     — Get my orders (auth required)
GET    /api/orders/:id                 — Get my order detail (auth required)
GET    /api/orders/admin/all           — Get all orders (admin only)
GET    /api/orders/admin/stats         — Dashboard stats (admin only)
GET    /api/orders/admin/:id           — Get any order (admin only)
PATCH  /api/orders/admin/:id/status    — Update order status (admin only)
```

---

## Features

### Customer
- Browse Nigerian menu with category filtering + search
- View detailed food pages
- Add items to cart (persisted to localStorage)
- Checkout and place orders
- View order history and status
- Update profile

### Admin
- View dashboard stats (orders, revenue, customers, menu items)
- Full CRUD for menu items (name, price, category, image, availability)
- Manage food categories
- View and manage all customer orders
- Update order status (Pending → Confirmed → Preparing → Ready → Out for Delivery → Delivered)

### Security
- Passwords hashed with bcrypt (12 rounds)
- JWT authentication, verified on every request
- Role-based authorization enforced on backend
- Users cannot self-assign admin role during registration
- No sensitive data (passwords, hashes) returned from API
- Historical order prices are stored at time of purchase

---

## Order Status Flow

```
Pending → Confirmed → Preparing → Ready → Out for Delivery → Delivered
                                                    ↓
                                               Cancelled (any stage)
```

---

## Environment Variables

See `.env.example` in the server directory:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=naija_bites
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

---

## Production Notes

1. Set `NODE_ENV=production`
2. Use a strong, unique `JWT_SECRET`
3. Configure proper `CLIENT_URL` for CORS
4. Use environment-specific PostgreSQL credentials
5. Build the frontend: `cd client && npm run build`
6. Serve the built frontend statically or via a CDN
