# Naija Bites — Backend API

Node.js + Express + PostgreSQL REST API for the Naija Bites restaurant platform.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
```

### 3. Create the PostgreSQL database
```bash
psql -U postgres -c "CREATE DATABASE naija_bites;"
```

### 4. Run migrations (creates all tables)
```bash
npm run db:migrate
```

### 5. Seed the database (menu items + admin account)
```bash
npm run db:seed
```

### 6. Start development server
```bash
npm run dev
```

API runs at: **http://localhost:5000**

---

## Demo Accounts (after seeding)

| Role     | Email                        | Password     |
|----------|------------------------------|--------------|
| Admin    | admin@naijabites.com         | Admin@12345  |
| Customer | customer@naijabites.com      | User@12345   |

---

## API Endpoints

```
GET  /api/health

POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me           (auth)
PUT  /api/auth/profile      (auth)

GET    /api/menu
GET    /api/menu/:id
POST   /api/menu            (admin)
PUT    /api/menu/:id        (admin)
DELETE /api/menu/:id        (admin)

GET    /api/categories
POST   /api/categories      (admin)
PUT    /api/categories/:id  (admin)
DELETE /api/categories/:id  (admin)

POST  /api/orders                      (auth)
GET   /api/orders                      (auth)
GET   /api/orders/:id                  (auth)
GET   /api/orders/admin/all            (admin)
GET   /api/orders/admin/stats          (admin)
GET   /api/orders/admin/:id            (admin)
PATCH /api/orders/admin/:id/status     (admin)
```

## Scripts

```bash
npm run dev          # Start with nodemon (hot reload)
npm start            # Start production
npm run db:migrate   # Create database tables
npm run db:seed      # Seed demo data
npm run db:setup     # migrate + seed
```
