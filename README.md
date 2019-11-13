Government Wiki
=======

Project uses:
- [AirBnb ESLint config](https://github.com/airbnb/javascript/tree/master/es5)
- [AirBnb ESLint config (RU)](https://github.com/uprock/javascript)

Before:
1. [Install nodejs + npm](https://nodejs.org/en/)
2. Install bower globally via npm ($npm install -g bower)

Gulp tasks:
- gulp install
- gulp watch
- gulp lint
- gulp lint --watch
- gulp build
- gulp build:js
- gulp build:vendor

## Installation troubleshooting ##

- Edit *docker/docker-compose.development.yml* db service to fix `mysql:5.7` version.
- Change user ID to 33 in docker/php-fpm/Dockerfile (`&& sed -i -- 's/33/1000/g' /etc/passwd \`)
- Build project: `docker-compose --project-name govwiki --file docker/docker-compose.development.yml up --build`
- Create parameters.yml from dist *app/config/parameters.yml.docker*
- Run command `composer install` in docker container govwiki_php-fpm
- Import DB into docker db container `docker exec -i govwiki_db_1 mysql -uroot -proot govwiki < govwiki_production.sql`
- Change environments rows in db container for example to *fiscal.govwiki.development*
- Create assets in php container `app/console assetic:dump --env=prod --no-debug`
- Edit */etc/hosts*
- Example URL: http://fiscal.govwiki.development:8081