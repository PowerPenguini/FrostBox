build-dev:
	docker compose -f docker-compose.dev.yaml down -v
	docker compose -f docker-compose.dev.yaml build

start-dev:
	docker compose -f docker-compose.dev.yaml up


build:
	docker compose down -v
	docker compose build

start:
	docker compose up