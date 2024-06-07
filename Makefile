include ./.env

DOCKER_DIR := ./
DOCKER_COMPOSE := /docker-compose.yml
PROJECT_NAME := transcendence

DOCKER_COMPOSE_CMD := docker compose -f $(DOCKER_DIR)$(DOCKER_COMPOSE) -p $(PROJECT_NAME)

all: build

build: 
	$(DOCKER_COMPOSE_CMD) up --build

start:
	$(DOCKER_COMPOSE_CMD) start

stop: 
	$(DOCKER_COMPOSE_CMD) stop

up:
	$(DOCKER_COMPOSE_CMD) up

down down_vol:
	$(DOCKER_COMPOSE_CMD) $@

erase:
	docker stop $$(docker ps -qa); docker rm $$(docker ps -qa); docker rmi -f $$(docker images -qa); docker volume rm $$(docker volume ls -q); docker network rm $$(docker network ls -q) 2>/dev/null

purge:
	docker system prune -f

fclean: erase purge

start: up

.PHONY: all build up down stop start down_vol erase purge fclean