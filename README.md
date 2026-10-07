# Ptech portfolio project

A starter monorepo for a responsive portfolio builder:

```text
frontend/                 React, Vite, and Tailwind CSS
  public/assets/          Ptech logo assets
  src/                    Landing page and UI
backend/                  Laravel PHP API
  app/                    Laravel application code
  routes/api.php           API routes
  database/migrations/     Application schema migrations
database/                 PostgreSQL setup and schema reference
  compose.yaml             Local PostgreSQL service
  schema.sql               Portfolio schema reference
```

## Start the database

Create `backend/.env` from `backend/.env.example`, set a local PostgreSQL
password, then start PostgreSQL:

```sh
docker compose --env-file backend/.env -f database/compose.yaml up -d
```

The PHP runtime must have the `pdo_pgsql` extension enabled. From `backend/`,
run `php artisan migrate` and `php artisan serve`. The API health endpoint is
available at `http://127.0.0.1:8000/api/health`.

## Start the frontend

From `frontend/`, run `npm install` and `npm run dev`. Create a production build
with `npm run build`.
