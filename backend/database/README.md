# Database

The Laravel migrations and seeders in this folder define the application
database. SQLite is the default for local development. To use PostgreSQL,
create the repository-root `.env` file if needed, then configure
`DB_CONNECTION=pgsql`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `DB_PORT`,
and `DB_HOST=127.0.0.1`. Choose a database name without path separators and
use a unique password. Keep `.env` local; never commit it.

Start the PostgreSQL 17 container from `backend/` after configuring those
values:

```sh
docker compose --env-file ../.env up -d
```

Use a different secret before exposing PostgreSQL outside your machine.

For Render deployment, see the root `render.yaml` and project `README.md`.
Run the Laravel migrations from `backend/` to create the complete application
schema and starter templates:

```sh
php artisan migrate
```

`schema.sql` is a PostgreSQL reference for the portfolio tables created by
Laravel's migrations. It assumes the standard Laravel `users` table already
exists. Laravel's migrations are the recommended way to update a running
application database; the SQL reference is not run automatically by Laravel.

To check when users last changed their password in PostgreSQL:

```sql
SELECT email, password_changed_at
FROM users
ORDER BY password_changed_at DESC NULLS LAST;
```

Passwords are stored as one-way hashes and cannot be viewed or recovered.
Use the password reset flow to let a user choose a new password.
