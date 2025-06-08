DEV_COMPOSE_FILE = docker-compose.dev.yaml
PROD_COMPOSE_FILE = docker-compose.yaml

DEV_ENV_FILE = .env.dev
PROD_ENV_FILE = .env.prod

build-dev:
	docker compose --env-file $(DEV_ENV_FILE) -f $(DEV_COMPOSE_FILE) down -v
	docker compose --env-file $(DEV_ENV_FILE) -f $(DEV_COMPOSE_FILE) build

start-dev:
	docker compose --env-file $(DEV_ENV_FILE) -f $(DEV_COMPOSE_FILE) up

build:
	docker compose --env-file $(PROD_ENV_FILE) down -v
	docker compose --env-file $(PROD_ENV_FILE) build

start:
	docker compose --env-file $(PROD_ENV_FILE) up -d

package:
	tar -czvf prod.tar.gz \
		--exclude='./hardware' \
		--exclude='./docker-compose.dev.yaml' \
		--exclude='./.env.dev' \
		--exclude='./backend/uta-processor/venv' \
		--exclude='./frontend/node_modules' \
		--exclude='./frontend/.next' \
		--exclude='./prod.tar.gz' \
		--exclude='./backend/uta-processor/__pycache__' \
		--exclude='./.git' \
		./* ./.*

roll:
	docker compose build
	docker compose down
	docker compose up -d