FROM php:8.4-cli-alpine

RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS postgresql-dev \
    && docker-php-ext-install pdo_pgsql \
    && apk del .build-deps \
    && apk add --no-cache libpq

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --no-scripts \
    --no-autoloader

COPY --chown=www-data:www-data . .

RUN composer dump-autoload --no-dev --optimize --no-scripts \
    && php artisan package:discover --ansi \
    && mkdir -p storage/app storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && sed -i 's/\r$//' docker-entrypoint.sh \
    && chmod +x docker-entrypoint.sh

USER www-data

EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]
