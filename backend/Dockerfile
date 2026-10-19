FROM php:8.3-cli-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev libpq-dev libxml2-dev libzip-dev \
    && docker-php-ext-install bcmath dom mbstring pdo_pgsql simplexml xml xmlwriter zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader --no-scripts

COPY . .

RUN mkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views \
    storage/logs bootstrap/cache \
    && composer dump-autoload --no-dev --optimize \
    && php artisan package:discover --ansi \
    && chown -R www-data:www-data storage bootstrap/cache

USER www-data

EXPOSE 10000

CMD ["sh", "-c", "php artisan migrate --force && exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"]
