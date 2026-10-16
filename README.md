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

## Start everything with Docker

From the repository root, run:

```sh
docker compose -f database/compose.yaml up --build
```

This starts PostgreSQL, runs the Laravel migrations, and starts the Laravel API
and Vite frontend. Open `http://localhost:5173`; the API health endpoint is
`http://localhost:8000/api/health`. Database data and Laravel storage persist in
Docker volumes. The local development database password defaults to
`change-me`; set `DB_PASSWORD` in the shell or Compose `.env` file to override
it. Press Ctrl+C to stop the services, or run
`docker compose -f database/compose.yaml down` from the repository root.

The frontend uses Laravel Sanctum bearer tokens; tokens are kept in the current
browser tab and expire after seven days. Passwords are hashed by Laravel before
storage. For manual development outside Docker, configure `backend/.env`, run
the database service, then run Laravel and Vite separately as described in
their project READMEs.

For a deployed frontend, add its origin to `backend/config/cors.php` before
deployment.
