# website-scool

This repository contains a lightweight prototype of a School Information System (SIS) for SMA NEGERI.

Architecture:
- Backend: Node.js + Express + SQLite (file: `/server`)
- Frontend: React (via CDN) + Bootstrap (static files in `/client`)

Quick start:

1. Install server dependencies

```bash
cd server
npm install
```

2. Seed default admin and start server

```bash
npm run seed
npm start
```

3. Open in browser: http://localhost:4000

Default admin credentials: `admin` / `admin123`

What's included:
- Authentication (JWT), user management, student management
- PPDB endpoints (apply/list/decide), grades, attendance, finance, reports
- A minimal React-based admin dashboard with student list and CRUD (create)

Notes:
- This is a prototype skeleton intended to be extended. For production use, secure secrets, enable HTTPS, and use a managed database.
