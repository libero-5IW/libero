import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { seedUsers } from './users.seeder';
import { seedDefaultQuoteTemplate } from './default-quote-template.seeder';
import { seedDefaultContractTemplate } from './default-contract-template.seeder';
import { seedDefaultInvoiceTemplate } from './default-invoice-template.seeder';
import { seedClients } from './clients.seeder';

const prisma = new PrismaClient();

async function main() {
  console.log('Démarrage du seeding…\n');

  await seedUsers(prisma);
  
  const user = await prisma.user.findFirst();
  await seedClients(prisma, user.id); 
  await seedDefaultQuoteTemplate(prisma);
  await seedDefaultContractTemplate(prisma);
  await seedDefaultInvoiceTemplate(prisma);

  console.log('\nSeeding terminé avec succès !');
}

main()
  .catch((error) => {
    console.error('Erreur pendant le seeding :', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
