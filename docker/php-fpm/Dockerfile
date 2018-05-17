FROM php:7.0-fpm-jessie

RUN apt-get update && apt-get -y --allow-unauthenticated install libgearman-dev wget unzip ruby-sass \
    && cd /tmp \
    && wget https://github.com/wcgallego/pecl-gearman/archive/gearman-2.0.3.zip \
    && unzip gearman-2.0.3.zip \
    && mv pecl-gearman-gearman-2.0.3 pecl-gearman \
    && cd pecl-gearman \
    && phpize \
    && ./configure \
    && make -j  \
    && make install \
    && cd / \
    && rm /tmp/gearman-2.0.3.zip \
    && rm -r /tmp/pecl-gearman \
    && docker-php-ext-enable gearman \
    && pecl install xdebug-2.5.0 \
    && docker-php-ext-install pdo pdo_mysql pcntl sysvmsg sysvsem \
    && docker-php-ext-enable xdebug \
    #
    # Install composer
    && cd /usr/bin \
    && curl --silent --show-error http://getcomposer.org/installer | php \
    && ln -s /usr/bin/composer.phar /usr/bin/composer \
    && chmod +x composer

#
# Configure container
#
RUN echo "xdebug.remote_enable=on" >> /usr/local/etc/php/php.ini \
    && echo "xdebug.remote_autostart=on" >> /usr/local/etc/php/php.ini \
    && echo "xdebug.remote_connect_back=1" >> /usr/local/etc/php/php.ini \
    && echo "xdebug.remote_handler=dbgp" >> /usr/local/etc/php/php.ini \
    && echo "xdebug.max_nesting_level=1000" >> /usr/local/etc/php/php.ini \
    && echo "xdebug.remote_port=9001" >> /usr/local/etc/php/php.ini \
    && echo "error_reporting = E_ALL" >> /usr/local/etc/php/php.ini \
    && echo "display_startup_errors = On" >> /usr/local/etc/php/php.ini \
    && echo "display_errors = On" >> /usr/local/etc/php/php.ini \
    #
    # Change user id for fpm user in order to allow change files.
    && sed -i -- 's/82/1000/g' /etc/passwd \
    #
    # Add useful aliases
    && echo "alias ls='ls --color=always'" >> /etc/profile \
    && echo "alias ll='ls -laF'" >> /etc/profile \
    && echo "alias sf='./app/console'" >> /etc/profile \
    && echo "alias dev='sf --env=dev'" >> /etc/profile \
    && echo "alias prod='sf --env=prod'" >> /etc/profile \
    && echo "alias c='composer'" >> /etc/profile \
    && mkdir /code

EXPOSE 9000

WORKDIR /code
