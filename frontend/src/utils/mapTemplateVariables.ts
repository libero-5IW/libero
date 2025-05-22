import type { InvoiceTemplateVariable } from '@/schemas/invoiceTemplate.schema';
import type { VariableBase, VariableType } from '@/types';

export function mapTemplateVariables(
  variables: Array<VariableBase>
): InvoiceTemplateVariable[] {
  return variables.map((v, index) => ({
    id: `${index}`, 
    ...v,
    type: v.type as VariableType,
  }));
}
