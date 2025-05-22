import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const modelMap = {
  quote: prisma.quote,
  invoice: prisma.invoice,
  contract: prisma.contract,
} as const;

export async function generateNextNumber(
  tableName: keyof typeof modelMap,
  userId: string,
  fieldName = 'number',
): Promise<number> {
  const model = modelMap[tableName];
  return getNextNumber(model, userId, fieldName);
}

async function getNextNumber(
  model: any,
  userId: string,
  fieldName: string,
): Promise<number> {
  const lastItem = await model.findFirst({
    where: { userId },
    orderBy: { [fieldName]: 'desc' },
  });

  return (lastItem?.[fieldName] ?? 0) + 1;
}
