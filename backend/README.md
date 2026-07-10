# Backend — Verdict API

Node.js + Express + Prisma + MySQL REST API for Verdict.

Full project documentation — setup, environment variables, API reference, and
deployment — lives in the [root README](../README.md).

## Quick start

```bash
cp .env.example .env          # set DATABASE_URL and other secrets
npm install                   # runs prisma generate via postinstall
npm run db:migrate            # apply migrations to MySQL
npm run dev
```

Listens on `PORT` (default `5000`).

## Database

- **ORM:** Prisma
- **Database:** MySQL
- **Schema:** `prisma/schema.prisma`
- **Migrations:** `prisma/migrations/`

```bash
npm run db:migrate:dev   # create/apply migrations in development
npm run db:studio        # open Prisma Studio
```
