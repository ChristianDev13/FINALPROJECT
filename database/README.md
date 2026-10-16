# Local application stack

From the repository root, start PostgreSQL, the Laravel API, and the Vite
frontend together:

```sh
docker compose -f database/compose.yaml up --build
```

Open `http://localhost:5173`. The Laravel API is available at
`http://localhost:8000`, and the database at `localhost:5432`. Migrations run
automatically once PostgreSQL is healthy. Database records and the generated
Laravel application key persist in Docker volumes. The development database
password defaults to `change-me`; set `DB_PASSWORD` in the shell or the
project-root Compose `.env` file to override it. All published ports bind to
localhost only.

Stop the stack with Ctrl+C or `docker compose -f database/compose.yaml down`.

`schema.sql` is a PostgreSQL reference for the portfolio tables created by
Laravel's migration. It assumes the standard Laravel `users` table already
exists; do not run it in addition to the matching Laravel migration.
