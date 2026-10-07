# PostgreSQL database

Start a local PostgreSQL 17 instance from this folder:

```sh
docker compose --env-file ../backend/.env up -d
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
exists; do not run it in addition to the matching Laravel migration.
