# Ptech portfolio project

A starter monorepo for a responsive portfolio builder:

```text
frontend/                 React, Vite, and Tailwind CSS
  public/assets/          Ptech logo assets
  src/                    Landing page and UI
backend/                  Laravel PHP API
  app/                    Laravel application code
  routes/api.php           API and token-authentication routes
  database/migrations/     Application schema migrations
  tests/Feature/           API and authentication tests
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
run `php artisan migrate` and `php artisan serve`. Registration, login, and
portfolio templates use the configured PostgreSQL database. The frontend uses
Laravel Sanctum bearer tokens; tokens are kept in the current browser tab and
expire after seven days. Passwords are hashed by Laravel before storage.

## Start the frontend

From `frontend/`, copy `.env.example` to `.env` if the API is not at its default
URL, then run `npm install` and `npm run dev`. Open `http://localhost:5173` and
use the **Login** or **Register** navigation links. Create a production bundle
with `npm run build`.

Run Laravel and Vite in separate terminals. The Laravel API runs at
`http://127.0.0.1:8000`; the health endpoint is
`http://127.0.0.1:8000/api/health`. For a deployed frontend, add its origin to
`backend/config/cors.php` before deployment.
