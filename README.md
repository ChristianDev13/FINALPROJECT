# Ptech Portfolio

A portfolio builder with a React frontend and Laravel API. The repository is
organized into two application folders:

- `frontend/` — React, Vite, and Tailwind CSS
- `backend/` — Laravel API, migrations, and database configuration

The root `.env.example` is the shared configuration template for both apps.
Copy it to `.env` in the repository root and keep that real environment file
private; it is excluded by `.gitignore`.

## Local development

1. Copy `.env.example` to `.env` in the repository root.
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
The default points to the local Laravel API.

## Password reset email

The backend uses Laravel's expiring, single-use password reset tokens. To send
reset emails, configure `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`,
`MAIL_USERNAME`, `MAIL_PASSWORD`, and `MAIL_FROM_ADDRESS` in the root `.env`.
For Gmail, use a Google App Password. Set `FRONTEND_URL` to the frontend's
deployed origin for production links. Never commit real mail credentials.

## PostgreSQL

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
