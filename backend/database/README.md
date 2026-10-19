# PostgreSQL database

Start a local PostgreSQL 17 instance from this folder:

```sh
docker compose --env-file ../.env up -d
```

The backend `.env` should use `DB_CONNECTION=pgsql`, host `127.0.0.1`, port
`5432`, and the same database credentials used by Compose. Change the
development password before exposing PostgreSQL outside your machine.

Run the Laravel migrations from `backend/` to create the complete application
schema and starter templates:

```sh
php artisan migrate
```

`schema.sql` is a PostgreSQL reference for the portfolio tables created by
Laravel's migration. It assumes the standard Laravel `users` table already
exists and adds the nullable `password_changed_at` column to track the last
password change. Laravel's migration is the recommended way to update a
running application database; the SQL reference is not run automatically by
Laravel.

To check when users last changed their password in PostgreSQL:

```sql
SELECT email, password_changed_at
FROM users
ORDER BY password_changed_at DESC NULLS LAST;
```

Passwords are stored as one-way hashes and cannot be viewed or recovered.
Use the password reset flow to let a user choose a new password.
