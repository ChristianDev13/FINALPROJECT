#!/bin/sh
set -eu

key_file="storage/app/docker-app-key"

if [ -z "${APP_KEY:-}" ]; then
    if [ -s "$key_file" ]; then
        APP_KEY="$(cat "$key_file")"
    else
        APP_KEY="$(php artisan key:generate --show --no-ansi)"
        printf '%s' "$APP_KEY" > "$key_file"
    fi
    export APP_KEY
fi

php artisan migrate --force

exec php artisan serve --host=0.0.0.0 --port=8000
