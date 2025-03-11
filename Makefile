MIGRATION_NAME ?= $(shell read -p "Nom de la migration : " name; echo $$name)
MODULE_NAME ?= $(shell read -p "Nom du module : " name; echo $$name)

# Prisma : Migration et génération de types
migrate:
	docker-compose exec backend npx prisma migrate dev --name $(MIGRATION_NAME)

generate:
	docker-compose exec backend npx prisma generate

# Création d'un module NestJS avec toutes les ressources
module:
	docker-compose exec backend nest g resource $(MODULE_NAME)

# Lancer l'application avec Docker Compose
start:
	docker-compose up

stop:
	docker-compose down

restart:
	docker-compose down && docker-compose up

# Exécuter les tests
test:
	docker-compose exec backend npm run test

test-watch:
	docker-compose exec backend npm run test:watch

test-e2e:
	docker-compose exec backend npm run test:e2e

test-cov:
	docker-compose exec backend npm run test:cov

# Nettoyage de Docker (ATTENTION : Supprime aussi les volumes !)
clean:
	docker-compose down -v

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
