import { z } from 'zod';

export const InvoiceVariableValueSchema = z.object({
  variableName: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
      message: 'Le nom de variable doit être en camelCase ou snake_case.',
    }),
  value: z.string(),
});

export const InvoiceSchema = z.object({
  id: z.string().uuid(),
  number: z.number(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  generatedHtml: z.string(),
  issuedAt: z.string(),   
  dueDate: z.string(),
  templateId: z.string().uuid(),
  userId: z.string().uuid(),
  clientId: z.string().uuid(),
  variableValues: z.array(InvoiceVariableValueSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type InvoiceVariableValue = z.infer<typeof InvoiceVariableValueSchema>;
