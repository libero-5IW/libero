import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('Démarrage du seeding…\n');

  await seedUsers(prisma);

  console.log('\nSeeding terminé avec succès !');
}

main()
  .catch((error) => {
    console.error('Erreur pendant le seeding :', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
