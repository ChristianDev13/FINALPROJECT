# Ptech Portfolio

A portfolio builder with a React frontend and Laravel API. The repository is
organized into two application folders:

- `frontend/` — React, Vite, and Tailwind CSS
- `backend/` — Laravel API, migrations, and database configuration

Both apps read configuration from `.env` in the repository root. Create that
file locally; it is excluded by `.gitignore` and must never be committed.

## Local development

1. Create a root `.env` file with local settings. At minimum:

   ```dotenv
   APP_NAME="Ptech Portfolio"
   APP_ENV=local
   APP_KEY=
   APP_DEBUG=true
   APP_URL=http://127.0.0.1:8000
   FRONTEND_URL=http://localhost:5173
   DB_CONNECTION=sqlite
   DB_DATABASE=database/database.sqlite
   VITE_API_URL=http://127.0.0.1:8000/api
   ```

   Add database credentials and mail settings only when you use those
   services. Never share or commit real credentials.

2. Install backend dependencies and prepare the SQLite database:

   ```sh
   cd backend
   composer install
   php artisan key:generate
   php artisan migrate
   php artisan serve --host 127.0.0.1 --port 8000
   ```

3. In another terminal, install and run the frontend:

   ```sh
   cd frontend
   npm install
   npm run dev
   ```

The frontend API URL is configurable with `VITE_API_URL` in the root `.env`.

## Password reset email

The backend uses Laravel's expiring, single-use password reset tokens. To send
reset emails, configure `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`,
`MAIL_USERNAME`, `MAIL_PASSWORD`, and `MAIL_FROM_ADDRESS` in the root `.env`.
For Gmail, use a Google App Password. Set `FRONTEND_URL` to the frontend's
deployed origin for production links. Never commit real mail credentials.

## Deployment

The Render Blueprint is in [`render.yaml`](render.yaml); the backend Docker
image is defined in [`backend/Dockerfile`](backend/Dockerfile).

1. In Vercel, import this repository and set the project root directory to
   `frontend`. Deploy once to get the Vercel production origin.
2. In Render, create a Blueprint for this repository and choose the `main`
   branch. During initial setup, provide the deployed Vercel origin for both
   `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS`. Render generates `APP_KEY` and
   connects the API to its PostgreSQL database. Its generated 256-bit key is
   recognized as Laravel's base64 key format automatically.
3. After Render finishes deploying, add `VITE_API_URL` to the Vercel project
   environment variables, using the Render API URL followed by `/api`, then
   redeploy. The Vercel routing configuration supports React Router routes
   such as `/login` and `/register`.

The free Render web service may sleep when idle, and the free PostgreSQL plan
is temporary and has limited storage. For persistent production accounts,
upgrade the database plan and web service before relying on this deployment.

## PostgreSQL for local development

SQLite is the default for local development. To use PostgreSQL, enable the PHP
`pdo_pgsql` extension and set `DB_CONNECTION=pgsql`,
`DB_DATABASE=ptech_portfolio`, and the database credentials in the root
`.env`.
Start the optional PostgreSQL container from `backend/`:

```sh
docker compose --env-file ../.env up -d
```

Then run `php artisan migrate` from `backend/`. See
[`backend/database/README.md`](backend/database/README.md) for details.
