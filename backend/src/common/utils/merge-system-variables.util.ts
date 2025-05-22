import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SystemVariable {
  id?: string;
  variableName: string;
  label: string;
  type: string;
  required: boolean;
  templateId?: string;
}
interface TemplateWithVariables {
  id: string;
  name: string;
  contentHtml: string;
  userId?: string | null;
  variables: SystemVariable[];
}

export async function mergeSystemVariables<T extends TemplateWithVariables>(
  template: T,
  modelName:
    | 'quoteTemplateVariable'
    | 'invoiceTemplateVariable'
    | 'contractTemplateVariable',
): Promise<T> {
  if (template.id === 'defaultTemplate') return template;

  const systemVariables = await (prisma as any)[modelName].findMany({
    where: { templateId: 'defaultTemplate' },
  });

  return {
    ...template,
    variables: [...template.variables, ...systemVariables],
  };
}
