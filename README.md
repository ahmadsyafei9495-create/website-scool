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

MySQL / MariaDB (optional but recommended):

1. Create database and user (example):

```bash
mysql -u root -p
CREATE DATABASE sis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sisuser'@'localhost' IDENTIFIED BY 'strongpassword';
GRANT ALL PRIVILEGES ON sis.* TO 'sisuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

2. Configure environment variables (create `.env` in `/server`):

```
USE_MYSQL=true
DB_HOST=localhost
DB_USER=sisuser
DB_PASSWORD=strongpassword
DB_NAME=sis
JWT_SECRET=replace_this_secret
```

3. Install and run server:

```bash
cd server
npm install
npm run seed      # creates default admin (uses bcrypt)
npm start
```

Notes:
- The project supports MySQL when `USE_MYSQL=true`; otherwise it uses a local SQLite file (`server/sis.db`).
- The SQL DDL is available in `server/schema.sql` if you want to apply it manually.
- Default admin account is created by `seed.js` when missing. Change the password after first login.
