import { VariableType } from '@/types'
import { z } from 'zod'

export const QuoteTemplateVariableSchema = z.object({
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

export const QuoteTemplateSchema = z.object({
  id: z.string().uuid().or(z.literal('defaultTemplate')),
  name: z.string().min(1, 'Le nom du template est requis.'),
  userId: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  contentHtml: z.string().min(1, 'Le contenu HTML est requis.'),
  variables: z.array(QuoteTemplateVariableSchema),
  pdfUrl: z.string().nullable().optional(),
  previewUrl: z.string().nullable().optional(),
  pdfKey: z.string(),
  previewKey: z.string(),
})

export const CreateQuoteTemplateSchema = z.object({
  name: z.string().min(1, 'Le nom du template est requis.'),
  contentHtml: z.string().min(1, 'Le contenu HTML est requis.'),
  variables: z.array(QuoteTemplateVariableSchema),
})

export type QuoteTemplate = z.infer<typeof QuoteTemplateSchema>
export type CreateQuoteTemplate = z.infer<typeof CreateQuoteTemplateSchema>
export type QuoteTemplateVariable = z.infer<typeof QuoteTemplateVariableSchema>

