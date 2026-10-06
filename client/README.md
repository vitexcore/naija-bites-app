# Naija Bites — Frontend

React 19 + Vite + Tailwind CSS v4 frontend for the Naija Bites Nigerian restaurant platform.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

App runs at: **http://localhost:5173**

> Make sure the backend API is running at `http://localhost:5000` first.
> The Vite dev server proxies `/api` requests to the backend automatically.

---

## Build for production
```bash
npm run build
npm run preview   # Preview the production build locally
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — hero, featured dishes, categories, testimonials |
| `/menu` | Full menu with search + category filter |
| `/menu/:id` | Food item detail page |
| `/cart` | Shopping cart |
| `/checkout` | Checkout (auth required) |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Customer order history + profile (auth required) |
| `/admin` | Admin dashboard (admin only) |

## Scripts

```bash
npm run dev      # Start Vite dev server (port 5173)
npm run build    # Build for production
npm run preview  # Preview production build
```
