import { z } from 'zod'

export const QuoteTemplateVariableSchema = z.object({
  id: z.string().uuid().or(z.literal('systemVariable')).optional(),
  variableName: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
      message: 'Le nom de variable doit être en camelCase ou snake_case.',
    }),
  label: z.string().min(1, 'Le label est requis.'),
  templateId: z.string().uuid().optional(),
  type: z.enum(['string', 'number', 'date', 'boolean']),
  required: z.boolean(),
})

export const QuoteTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Le nom du template est requis.'),
  contentHtml: z.string().min(1, 'Le contenu HTML est requis.'),
  userId: z.string().optional(),
  variables: z.array(QuoteTemplateVariableSchema),
})

export type QuoteTemplate = z.infer<typeof QuoteTemplateSchema>
export type QuoteTemplateVariable = z.infer<typeof QuoteTemplateVariableSchema>

