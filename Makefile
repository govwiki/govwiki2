include makefile.config

#
# Insure that docker and docker compose command is exists.
#
DOCKER := $(shell command -v docker 2> /dev/null)
DOCKER_COMPOSE := $(shell command -v docker-compose 2> /dev/null)

DOCKER_COMPOSE_FLAGS := --project-name $(PROJECT_NAME)
DOCKER_COMPOSE_DEV_FLAGS := $(DOCKER_COMPOSE_FLAGS) --file ./docker/docker-compose.development.yml

ifndef DOCKER
$(error You should install 'docker' first)
endif

ifndef DOCKER_COMPOSE
$(error You should install 'docker-compose' first)
endif

command := /bin/ash -l

.PHONY: start db-cli app-cli node-cli node-restart

#
# Start application in docker containers. Development environment.
#
start:
	$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_DEV_FLAGS) up --build

#
# Open shell to one of container.
#
# Example:
#
#       make shell container=php-fpm
#
# or
#
#       make shell container=mysql command='mysql -u root -p'
#
#
shell:
	$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_DEV_FLAGS) exec $(container) $(command)

#
# Restart container.
#
# Example:
#
#       make restart container=php-fpm
#
restart:
	$(DOCKER_COMPOSE) $(DOCKER_COMPOSE_DEV_FLAGS) restart $(container)
