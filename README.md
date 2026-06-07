# Super Slugger League Fantasy

A full-stack fantasy league app built for custom leagues in **Mario Super Sluggers** (Wii). Designed with CPU vs CPU gameplay in mind, SSL Fantasy handles everything from real-time drafting to full season management and continuous league resets.

**URL to Live Website:** [sslfantasy.com](https://sslfantasy.com/homepage)

---

## Features

- **Real-time Draft** — Live snake draft or standard draft with Socket.io, synced across all connected users
- **Roster Management** — Build and manage your team of Mario Super Sluggers CPU characters
- **Automated Scheduling** — Schedule engine generates full regular season matchups, standings, and playoff brackets
- **Stat Tracking** — Track player stats across the season with live updates
- **Live Standings** — Real-time standings updated as scores are submitted
- **League Resets** — Full league reset system for continuous season-over-season play
- **Authentication** — Secure user auth via Supabase with JWT validation
- **Server-Side Rendering** — Built with Angular SSR for fast initial load times

---

## Tech Stack

**Frontend**
- Angular 21 with SSR
- Angular Material
- Socket.io Client

**Backend**
- Node.js / Express 5
- Socket.io
- Supabase (Auth + Database)
- PostgreSQL

**Dev Tools**
- TypeScript
- Vitest
- Prettier

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm 11+
- Supabase project

### Installation

```bash
git clone https://github.com/cadenebert/ultimatefantasy.git
cd ultimatefantasy
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

### Running Locally

Start the backend server:
```bash
npm run server
```

Start the Angular dev server (with proxy):
```bash
npm start
```

---

## Testing

```bash
npm test
```

Unit tests are written with Vitest, mocking the Supabase client to isolate service logic.

---

## Deployment

The app is deployed on DigitalOcean with a custom domain and SSL certificate. The Angular app is served via SSR using the built server bundle:

```bash
npm run build
npm run serve:ssr:ultimatefantasy
```

---

