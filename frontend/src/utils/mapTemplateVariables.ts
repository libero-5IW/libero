import type { InvoiceTemplateVariable } from '@/schemas/invoiceTemplate.schema';

export function mapTemplateVariablesForFrontend(
  variables: Array<{ variableName: string; label: string; type: string; required: boolean }>
): InvoiceTemplateVariable[] {
  return variables.map((v) => ({
    ...v,
    type: v.type as 'string' | 'number' | 'boolean' | 'date',
  }));
}
