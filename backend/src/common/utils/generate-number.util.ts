import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateNextNumber(
  tableName: 'quote' | 'invoice' | 'contract',
  userId: string,
  fieldName: string = 'number',
): Promise<number> {
  switch (tableName) {
    case 'quote':
      return getNextNumber(prisma.quote, userId, fieldName);
    case 'invoice':
      return getNextNumber(prisma.invoice, userId, fieldName);
    case 'contract':
      return getNextNumber(prisma.contract, userId, fieldName);
    default:
      throw new Error('Invalid table name');
  }
}

async function getNextNumber(model: any, userId: string, fieldName: string): Promise<number> {
  const lastItem = await model.findFirst({
    where: { userId },
    orderBy: { [fieldName]: 'desc' },
  });

  return (lastItem?.[fieldName] ?? 0) + 1;
}
