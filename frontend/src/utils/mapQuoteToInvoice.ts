import type { InvoiceTemplateVariable } from '@/schemas/invoiceTemplate.schema'
import type { QuoteVariableValue } from '@/schemas/quote.schema'

export function mapQuoteToInvoiceVariables(
    invoiceVars: InvoiceTemplateVariable[],
    quoteVars: QuoteVariableValue[]
  ) {
    const quoteMap = new Map(quoteVars.map(v => [v.variableName, v.value]))
  
    return invoiceVars.map(v => ({
      variableName: v.variableName,
      value: quoteMap.get(v.variableName) ?? '',
      label: v.label,
      type: v.type,
      required: v.required
    }))
  }
  