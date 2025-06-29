import { VariableType } from '@/types';
import { z } from 'zod';

export const CreateInvoiceVariableValueSchema = z.object({
  variableName: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
      message: 'Le nom de variable doit être en camelCase ou snake_case.',
    }),
  value: z.string(),
});

export const CreateInvoiceSchema = z.object({
  clientId: z.string().uuid({
    message: "L'identifiant du client doit être un UUID valide.",
  }).nullable().optional(),
  templateId: z.string().uuid({
    message: "L'identifiant du template doit être un UUID valide.",
  }),
  generatedHtml: z.string().min(1, {
    message: 'Le HTML généré est requis.',
  }),
  dueDate: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'La date d’échéance doit être une date ISO valide.' }
  ),
  issuedAt: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "La date d'émission doit être une date ISO valide.",
    })
    .optional(),
  variableValues: z
    .array(CreateInvoiceVariableValueSchema)
    .min(1, { message: 'Au moins une variable est requise.' }),
});

export const InvoiceVariableValueSchema = z.object({
  id: z.string().uuid(),
  invoiceId: z.string().uuid(),
  variableName: z.string(),
  label: z.string(),
  type: z.nativeEnum(VariableType),
  required: z.boolean(),
  value: z.string(),
});

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  number: z.number(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  generatedHtml: z.string(),
  issuedAt: z.string().nullable().optional(),
  dueDate: z.string(),
  templateId: z.string().uuid().or(z.literal('defaultTemplate')).nullable(),
  userId: z.string().uuid(),
  clientId: z.string().uuid().nullable(),
  pdfUrl: z.string().optional(),
  previewUrl: z.string().optional(),
  pdfKey: z.string(),
  previewKey: z.string(),
  variableValues: z.array(InvoiceVariableValueSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateInvoice = z.infer<typeof CreateInvoiceSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceVariableValue = z.infer<typeof InvoiceVariableValueSchema>;
