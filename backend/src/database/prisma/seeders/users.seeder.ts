import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export async function seedUsers(prisma: PrismaClient) {
  const hashedPassword = await bcrypt.hash('azerty123', 10);

  const freelancers = [
    {
      firstName: 'Hema',
      lastName: 'Birabourame',
      email: 'hema@libero.com',
      addressLine: '10 rue des Oliviers',
      postalCode: '75010',
      city: 'Paris',
      country: 'France',
      legalStatus: 'SASU',
      siret: '10000000000001',
      companyName: 'Hema Dev',
      password: hashedPassword,
    },
    {
      firstName: 'Racha',
      lastName: 'Ramoul',
      email: 'racha@libero.com',
      addressLine: '20 avenue de la République',
      postalCode: '13001',
      city: 'Marseille',
      country: 'France',
      legalStatus: 'Auto-entrepreneur',
      siret: '10000000000002',
      companyName: 'Racha Web',
      password: hashedPassword,
    },
    {
      firstName: 'Sarah',
      lastName: 'Salamani',
      email: 'sarah@libero.com',
      addressLine: '35 boulevard de la Liberté',
      postalCode: '69000',
      city: 'Lyon',
      country: 'France',
      legalStatus: 'EURL',
      siret: '10000000000003',
      companyName: 'Sarah Code',
      password: hashedPassword,
    },
    {
      firstName: 'Jay',
      lastName: 'Bury',
      email: 'jay@libero.com',
      addressLine: '50 rue Nationale',
      postalCode: '31000',
      city: 'Toulouse',
      country: 'France',
      legalStatus: 'SARL',
      siret: '10000000000004',
      companyName: 'Jay Studio',
      password: hashedPassword,
    },
  ];

  for (const user of freelancers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log('Freelances créés avec succès !');
}
