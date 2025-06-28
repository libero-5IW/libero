import { z } from 'zod'

export const ClientSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
  firstName: z.string().min(1, 'Le prénom est requis.'),
  lastName: z.string().min(1, 'Le nom est requis.'),
  email: z.string().email('Email invalide.'),
  phoneNumber: z.string().min(5, 'Le numéro doit contenir plus de 5 chiffres.'),
  addressLine: z.string().min(1, 'L’adresse est requise.'),
  postalCode: z.string().min(1, 'Le code postal est requis.'),
  city: z.string().min(1, 'La ville est requise.'),
  country: z.string().default('France'),
  createdAt: z.string(),
  updatedAt: z.string()
})

export const ClientCreateSchema = ClientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type Client = z.infer<typeof ClientSchema>
