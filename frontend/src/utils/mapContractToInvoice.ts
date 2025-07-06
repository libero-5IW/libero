import type { InvoiceTemplateVariable } from '@/schemas/invoiceTemplate.schema'
import type { ContractVariableValue } from '@/schemas/contract.schema'

export function mapContractToInvoiceVariables(
    invoiceVars: InvoiceTemplateVariable[],
    contractVars: ContractVariableValue[]
) {
  const contractMap = new Map(contractVars.map(v => [v.variableName, v.value]))

  return invoiceVars.map(v => ({
    variableName: v.variableName,
    value: contractMap.get(v.variableName) ?? '',
    label: v.label,
    type: v.type,
    required: v.required
  }))
}
