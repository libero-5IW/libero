import { z } from 'zod'

export const InvoiceTemplateVariableSchema = z.object({
  id: z.string().uuid().or(z.literal('systemVariable')).or(z.string()).optional(), 
  variableName: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
      message: 'Le nom de variable doit être en camelCase ou snake_case.',
    }),
  label: z.string().min(1, 'Le label est requis.'),
  templateId: z.string().uuid().or(z.literal('defaultTemplate')).optional(), 
  type: z.enum(['string', 'number', 'date', 'boolean']),
  required: z.boolean(),
})

export const InvoiceTemplateSchema = z.object({
  id: z.string().uuid().or(z.literal('defaultTemplate')).optional(), 
  name: z.string().min(1, 'Le nom du template est requis.'),
  contentHtml: z.string().min(1, 'Le contenu HTML est requis.'),
  variables: z.array(InvoiceTemplateVariableSchema),
})

export type InvoiceTemplate = z.infer<typeof InvoiceTemplateSchema>
export type InvoiceTemplateVariable = z.infer<typeof InvoiceTemplateVariableSchema>
