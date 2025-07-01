import type { ContractTemplateVariable } from '@/schemas/contractTemplate.schema'
import type { QuoteVariableValue } from '@/schemas/quote.schema'

export function mapQuoteToContractVariables(
  contractVars: ContractTemplateVariable[],
  quoteVars: QuoteVariableValue[]
) {
  const quoteMap = new Map(quoteVars.map(v => [v.variableName, v.value]))

  return contractVars.map(v => ({
    variableName: v.variableName,
    value: quoteMap.get(v.variableName) ?? '',
    label: v.label,
    type: v.type,
    required: v.required
  }))
}
