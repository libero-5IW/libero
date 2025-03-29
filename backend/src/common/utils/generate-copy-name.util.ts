import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateCopyName(params: {
  table: keyof PrismaClient;
  nameField: string;
  baseName: string;
}): Promise<string> {
  const { table, nameField, baseName } = params;

  const model = prisma[table] as any;

  const existing = await model.findMany({
    where: {
      [nameField]: {
        startsWith: `${baseName} (copie`,
      },
    },
    select: { [nameField]: true },
  });

  const count = existing.length;

  if (!count) return `${baseName} (copie)`;

  return `${baseName} (copie ${count + 1})`;
}
