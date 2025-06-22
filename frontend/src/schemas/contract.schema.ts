import { VariableType } from '@/types';
import { z } from 'zod';

export const CreateContractVariableValueSchema = z.object({
  variableName: z
    .string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
      message: 'Le nom de variable doit être en camelCase ou snake_case.',
    }),
  value: z.string(),
});

export const CreateContractSchema = z.object({
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
    .array(CreateContractVariableValueSchema)
    .min(1, { message: 'Au moins une variable est requise.' }),
});

export const ContractVariableValueSchema = z.object({
  id: z.string().uuid(),
  contractId: z.string().uuid(),
  variableName: z.string(),
  label: z.string(),
  type: z.nativeEnum(VariableType),
  required: z.boolean(),
  value: z.string(),
});

export const ContractSchema = z.object({
  id: z.string().uuid(),
  number: z.number(),
  status: z.enum(['draft', 'signed', 'expired', 'cancelled']),
  generatedHtml: z.string(),
  issuedAt: z.string().nullable().optional(),
  validUntil: z.string(),
  templateId: z.string().uuid().or(z.literal('defaultTemplate')).nullable(),
  userId: z.string().uuid(),
  clientId: z.string().uuid(),
  variableValues: z.array(ContractVariableValueSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CreateContract = z.infer<typeof CreateContractSchema>;
export type Contract = z.infer<typeof ContractSchema>;
export type ContractVariableValue = z.infer<typeof ContractVariableValueSchema>;
