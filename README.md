# FabHomes – Real Estate Discovery MVP

Level 1 customer-facing MVP: discovery → details → lead capture. Brand name is configurable via `lib/brandConfig.ts`.

## Tech stack

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**
- Minimal dependencies; no heavy UI kits

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- **`app/`** – Routes: home, search, property/[id], login, signup, saved, about, contact, terms, privacy
- **`components/`** – Header, Footer, search (HeroSearch, SearchFilters, SearchSummaryBar), properties (Card, List, Badges, Gallery, KeyDetails, AmenitiesList), forms (Lead, Login, Signup, Contact), common (Button, Input, Select, Checkbox, ToggleGroup, EmptyState)
- **`lib/`** – brandConfig, types, mockData, savedProperties (localStorage), filters (filter/sort), utils (format price/type)

## Features

- **Home**: Hero search (mode, location, type, budget), featured properties, browse by type, “Why FabHomes”
- **Search**: URL-driven filters and sort; filter panel (desktop sidebar, mobile collapsible); property grid with save (heart) and “View details”
- **Property detail**: Gallery, key details, description, amenities, sticky lead form (name, mobile, email, message, “interested in similar”)
- **Saved**: List of saved property IDs from localStorage; remove via heart on card
- **Login / Sign up**: Mock auth (stores user in localStorage, redirects)
- **About / Contact**: Static content and contact form (simulated submit)

## Config

- **Brand**: Change `BRAND_NAME` in `lib/brandConfig.ts`; it’s used in header, hero, about, footer, etc.
- **Images**: Mock data uses Unsplash URLs; `next.config.js` allows `images.unsplash.com`.

## Non-goals (Level 1)

No maps, EMI calculator, analytics, recommendations, or real auth. Discovery → details → lead capture only.
