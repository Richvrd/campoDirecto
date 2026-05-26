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
