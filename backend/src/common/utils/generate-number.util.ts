import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateNextNumber(
  tableName: 'quote' | 'invoice' | 'contract',
  userId: string,
  fieldName: string = 'number',
): Promise<number> {
  const lastItem = await prisma[tableName].findFirst({
    where: { userId },
    orderBy: { [fieldName]: 'desc' },
  });

  return (lastItem?.[fieldName] ?? 0) + 1;
}
