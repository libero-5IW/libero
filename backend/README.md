Accès au frontend : 
- 

Accès au backend : 
- localhost:8000/

Accès à swagger : 
- localhost:8000/doc

Accès à prisma studio :
- localhost:5555/


Ajout ou modification d'un modèle dans le fichier schema.prisma
 - migration : npx prisma migrate dev --name init
 - npx prisma generate


Créer un nouveau module (avec controller, service, test, dto, entities) : 
- nest g resource ${nom}