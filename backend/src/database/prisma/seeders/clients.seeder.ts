import { PrismaClient } from '@prisma/client';

export async function seedClients(prisma: PrismaClient, userId: string) {
  const clients = [
    {
      firstName: 'Client A',
      lastName: 'Martin',
      email: 'client.a@libero.com',
      phoneNumber: '0600000001',
      addressLine: '1 rue de Paris',
      postalCode: '75001',
      city: 'Paris',
      country: 'France',
    },
    {
      firstName: 'Client B',
      lastName: 'Durand',
      email: 'client.b@libero.com',
      phoneNumber: '0600000002',
      addressLine: '2 avenue de Lyon',
      postalCode: '69001',
      city: 'Lyon',
      country: 'France',
    },
    {
      firstName: 'Client C',
      lastName: 'Dupont',
      email: 'client.c@libero.com',
      phoneNumber: '0600000003',
      addressLine: '3 boulevard de Marseille',
      postalCode: '13001',
      city: 'Marseille',
      country: 'France',
    },
  ];

  for (const client of clients) {
    await prisma.client.upsert({
        where: {
            userId_email: {
              userId,
              email: client.email,
            },
          },
      update: {},
      create: {
        ...client,
        userId,
      },
    });
  }

  console.log('Clients créés avec succès !');
}
