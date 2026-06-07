# Super Slugger League Fantasy

A full-stack fantasy baseball league app with real-time drafting, roster management, and automated schedule generation.

🌐 **Live:** [sslfantasy.com](https://sslfantasy.com/homepage)

---

## Features

- **Real-time Draft** — Live snake draft with Socket.io, synced across all connected users
- **Roster Management** — Add, drop, and manage players throughout the season
- **Automated Scheduling** — Schedule engine generates regular season matchups, standings, and playoff brackets
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

## Project Structure

```
ultimatefantasy/
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── ...
├── server.js        # Express + Socket.io server
├── proxy.conf.json  # Dev proxy config
└── ...
```

---

## License

MIT
