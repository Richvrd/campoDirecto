#!/usr/bin/env bash

if [ ! -f .env ]; then
    cp .env.example .env
fi

if [ ! -d .docker ]; then
    mkdir -p .docker
fi

if [ ! -d .docker/8.3 ]; then
    mkdir -p .docker/8.3
fi

cat > .docker/8.3/Dockerfile << 'EOF'
FROM ubuntu:22.04

LABEL maintainer="Taylor Otwell"

ARG WWWGROUP
ARG WWWUSER

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    libzip-dev \
    zip \
    software-properties-common \
    && add-apt-repository -y ppa:ondrej/php \
    && apt-get update && apt-get install -y \
    php8.3 \
    php8.3-cli \
    php8.3-pdo \
    php8.3-mysql \
    php8.3-zip \
    php8.3-xml \
    php8.3-mbstring \
    php8.3-curl \
    php8.3-gd \
    php8.3-opcache \
    php8.3-readline \
    php8.3-queue \
    git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN update-alternatives --set php /usr/bin/php8.3

RUN userdel -r ubuntu
RUN groupadd -g $WWWGROUP www
RUN useradd -u $WWWUSER -m -g www www

WORKDIR /var/www/html

COPY .docker/php/laravel.ini /usr/local/etc/php/conf.d/laravel.ini
COPY .docker/php/php.ini /usr/local/etc/php/php.ini

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

COPY --from=mlocati/php-lib-extension /usr/local/etc/php/conf.d/00-mysqli-default-charset.ini /usr/local/etc/php/conf.d/
COPY --from=mlocati/php-lib-extension /usr/local/etc/php/conf.d/00-mysqli.default_socket.ini /usr/local/etc/php/conf.d/

USER www

EOF

cat > .docker/phar/Dockerfile << 'EOF'
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://phar.phpunit.de/phpunit.phar -o /usr/local/bin/phpunit \
    && chmod +x /usr/local/bin/phpunit \
    && curl -fsSL https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/html

COPY . /var/www/html

USER www

CMD ["phpunit"]

EOF

cat > .docker/php/laravel.ini << 'EOF'
date.timezone = America/Santiago
display_errors = On
memory_limit = 512M
upload_max_filesize = 64M
post_max_size = 64M
EOF

cat > .docker/php/php.ini << 'EOF'
date.timezone = America/Santiago
display_errors = On
memory_limit = 512M
upload_max_filesize = 64M
post_max_size = 64M
EOF
