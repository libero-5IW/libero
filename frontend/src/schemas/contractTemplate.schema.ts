import { VariableType } from '@/types';
import { z } from 'zod'

export const ContractTemplateVariableSchema = z.object({
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

export const ContractTemplateSchema = z.object({
  id: z.string().uuid().or(z.literal('defaultTemplate')).optional(),
  name: z.string().min(1, 'Le nom du template est requis.'),
  contentHtml: z.string().min(1, 'Le contenu HTML est requis.'),
  userId: z.string().uuid().nullable(),
  variables: z.array(ContractTemplateVariableSchema),
})

export type ContractTemplate = z.infer<typeof ContractTemplateSchema>
export type ContractTemplateVariable = z.infer<typeof ContractTemplateVariableSchema>
