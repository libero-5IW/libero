import { VariableType } from '@/types';
import { z } from 'zod'

export const InvoiceTemplateVariableSchema = z.object({
  id: z.string().uuid().optional(),
  variableName: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
      message: 'Le nom de variable doit être en camelCase ou snake_case.',
    }),
  label: z.string().min(1, 'Le label est requis.'),
  templateId: z.string().uuid().or(z.literal('defaultTemplate')).optional(), 
  type: z.nativeEnum(VariableType),
  required: z.boolean(),
})

export const InvoiceTemplateSchema = z.object({
  id: z.string().uuid().or(z.literal('defaultTemplate')).optional(), 
  name: z.string().min(1, 'Le nom du template est requis.'),
  userId: z.string().uuid().nullable(),
  contentHtml: z.string().min(1, 'Le contenu HTML est requis.'),
  variables: z.array(InvoiceTemplateVariableSchema),
})

export const CreateInvoiceTemplateSchema = z.object({
  id: z.string().uuid().or(z.literal('defaultTemplate')).optional(), 
  name: z.string().min(1, 'Le nom du template est requis.'),
  contentHtml: z.string().min(1, 'Le contenu HTML est requis.'),
  variables: z.array(InvoiceTemplateVariableSchema),
})

export type InvoiceTemplate = z.infer<typeof InvoiceTemplateSchema>
export type CreateInvoiceTemplate = z.infer<typeof CreateInvoiceTemplateSchema>
export type InvoiceTemplateVariable = z.infer<typeof InvoiceTemplateVariableSchema>
