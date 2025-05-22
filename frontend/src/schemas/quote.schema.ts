import { VariableType } from '@/types';
import { z } from 'zod';

export const CreateQuoteVariableValueSchema = z.object({
  variableName: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
      message: 'Le nom de variable doit être en camelCase ou snake_case.',
    }),
  value: z.string(),
});

export const CreateQuoteSchema = z.object({
  clientId: z.string().uuid({
    message: "L'identifiant du client doit être un UUID valide.",
  }),
  templateId: z.string().uuid({
    message: "L'identifiant du template doit être un UUID valide.",
  }),
  generatedHtml: z.string().min(1, {
    message: 'Le HTML généré est requis.',
  }),
  validUntil: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'La date de validité doit être une date ISO valide.' }
  ),
  issuedAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La date d'émission doit être une date ISO valide.",
    })
    .optional(),
  variableValues: z
    .array(CreateQuoteVariableValueSchema)
    .min(1, { message: 'Au moins une variable est requise.' }),
})

export const QuoteVariableValueSchema = z.object({
  id: z.string().uuid(),
  quoteId: z.string().uuid(),
  variableName: z.string(),
  label: z.string(),
  type: z.nativeEnum(VariableType),
  required: z.boolean(),
  value: z.string(),
});

export const QuoteSchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid().or(z.literal('defaultTemplate')).nullable(),
  userId: z.string().uuid(),
  clientId: z.string().uuid(),
  status: z.enum(['draft', 'sent', 'accepted', 'refused']),
  number: z.number(),
  generatedHtml: z.string(),
  issuedAt: z.string().nullable().optional(),
  validUntil: z.string(),  
  createdAt: z.string(),   
  updatedAt: z.string(),   
  variableValues: z.array(QuoteVariableValueSchema),
});

export type CreateQuote = z.infer<typeof CreateQuoteSchema>
export type Quote = z.infer<typeof QuoteSchema>;
export type QuoteVariableValue = z.infer<typeof QuoteVariableValueSchema>;
