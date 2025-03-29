DOCKER_COMPOSE = docker-compose

# Initialize project: install dependencies and start Docker
init:
	cd backend && npm install
	cd frontend && npm install
	$(DOCKER_COMPOSE) up

# Prisma: run migration and generate types
migrate:
	@read -p "Migration name: " name; \
	$(DOCKER_COMPOSE) exec backend npx prisma migrate dev --name $$name

generate:
	$(DOCKER_COMPOSE) exec backend npx prisma generate

# Create a full NestJS resource module
resource:
	@read -p "Module name: " name; \
	cd backend && nest g resource resources/$$name

# Start the application with Docker Compose
start:
	$(DOCKER_COMPOSE) up

stop:
	$(DOCKER_COMPOSE) down

restart:
	$(DOCKER_COMPOSE) down && $(DOCKER_COMPOSE) up

# Run tests
test:
	$(DOCKER_COMPOSE) exec backend npm run test

test-watch:
	$(DOCKER_COMPOSE) exec backend npm run test:watch

test-e2e:
	$(DOCKER_COMPOSE) exec backend npm run test:e2e

test-cov:
	$(DOCKER_COMPOSE) exec backend npm run test:cov

# View backend logs
logs:
	$(DOCKER_COMPOSE) logs -f backend

# Cleanup Docker (WARNING: also removes volumes)
clean:
	$(DOCKER_COMPOSE) down -v

# Show available commands
help:
	@echo "Commandes disponibles :"
	@echo "  make migrate           - Exécuter une migration Prisma (nom demandé)"
	@echo "  make generate          - Générer Prisma Client"
	@echo "  make module            - Créer un module NestJS (nom demandé)"
	@echo "  make start             - Démarrer l'application avec Docker Compose"
	@echo "  make stop              - Arrêter les conteneurs Docker"
	@echo "  make restart           - Redémarrer les conteneurs Docker"
	@echo "  make test              - Exécuter les tests unitaires"
	@echo "  make test-watch        - Lancer les tests en mode watch"
	@echo "  make test-e2e          - Exécuter les tests End-to-End"
	@echo "  make test-cov          - Générer un rapport de couverture de tests"
	@echo "  make logs              - Voir les logs du conteneur backend"
	@echo "  make clean             - Supprimer les containers et volumes Docker"
	@echo "  make help              - Afficher cette aide"
