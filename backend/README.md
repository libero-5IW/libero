## **Accès aux services**

- **Backend** : [http://localhost:8000/](http://localhost:8000/)
- **Swagger** : [http://localhost:8000/doc](http://localhost:8000/doc)

- **Prisma Studio** : [http://localhost:5555/](http://localhost:5555/)

---

## **Pré-requis**

➡️ **Se placer à la racine du projet** avant toute commande :

```bash
cd chemin/vers/le/projet
```

---

## **Commandes utiles**

### Ajout ou modification d’un modèle Prisma

- Générer une migration :
  ```bash
  make migrate
  ```
  *Exemple de nom de migration :* `createUser`

- Générer le client Prisma :
  ```bash
  make generate 
  ```
---

### Création d’un nouveau module NestJS

- Générer un module avec controller, service, DTOs, entity et tests :
  ```bash
  make resource
  ```
> *Le nom du module sera demandé lors de l’exécution.*
