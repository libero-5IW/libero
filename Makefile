DOCKER_COMPOSE = docker-compose

init:
	cd backend && npm install
	cd frontend && npm install
	$(DOCKER_COMPOSE) up

# Prisma : Migration et génération de types
migrate:
	@read -p "Nom de la migration : " name; \
	$(DOCKER_COMPOSE) exec backend npx prisma migrate dev --name $$name

generate:
	$(DOCKER_COMPOSE) exec backend npx prisma generate

# Création d'un module NestJS avec toutes les ressources
resource:
	@read -p "Nom du module : " name; \
	cd backend && nest g resource resources/$$name

# Lancer l'application avec Docker Compose
start:
	$(DOCKER_COMPOSE) up

stop:
	$(DOCKER_COMPOSE) down

restart:
	$(DOCKER_COMPOSE) down && $(DOCKER_COMPOSE) up

# Exécuter les tests
test:
	$(DOCKER_COMPOSE) exec backend npm run test

test-watch:
	$(DOCKER_COMPOSE) exec backend npm run test:watch

test-e2e:
	$(DOCKER_COMPOSE) exec backend npm run test:e2e

test-cov:
	$(DOCKER_COMPOSE) exec backend npm run test:cov

# Voir les logs du backend
logs:
	$(DOCKER_COMPOSE) logs -f backend

# Nettoyage de Docker (ATTENTION : Supprime aussi les volumes !)
clean:
	$(DOCKER_COMPOSE) down -v

# Afficher l'aide
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
