import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  companyName: z.string(),
  addressLine: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
  legalStatus: z.string(),
  siret: z.string(),
  tvaNumber: z.string(),
  createdAt: z.string(),
})

export const ApiCurrentUserSchema = z.object({
    userId: z.string(),
    email: z.string()
})

export const LoginDataSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    password: z.string(),
})

export const RegisterDataSchema = z.object({
    firstName: z.string().min(1, 'Prénom requis').max(50, '50 caractères maximum'),
    lastName: z.string().min(1, 'Nom requis').max(50, '50 caractères maximum'),
    email: z.string().email('Email invalide'),
    password: z.string()
    .min(12, 'Au moins 12 caractères')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[a-z]/, 'Doit contenir une minuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Doit contenir un caractère spécial'),
    companyName: z.string().optional(),
    addressLine: z.string().min(1, 'Adresse requise'),
    postalCode: z.string().min(1, 'Code postal requis'),
    city: z.string().min(1, 'Ville requise'),
    country: z.string().min(1, 'Pays requis'),
    legalStatus: z.string().min(1, 'Statut légal requis'),
    siret: z.string().min(1, 'Numéro de siret requis').regex(/^\d{14}$/, 'Le SIRET doit contenir exactement 14 chiffres'),
    tvaNumber: z.string().optional()
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string()
  .min(12, 'Au moins 12 caractères')
  .regex(/[A-Z]/, 'Doit contenir une majuscule')
  .regex(/[a-z]/, 'Doit contenir une minuscule')
  .regex(/[0-9]/, 'Doit contenir un chiffre')
  .regex(/[^A-Za-z0-9]/, 'Doit contenir un caractère spécial')
})

export type User = z.infer<typeof UserSchema>
export type ApiCurrentUser = z.infer<typeof ApiCurrentUserSchema>
export type LoginData = z.infer<typeof LoginDataSchema>
export type RegisterData = z.infer<typeof RegisterDataSchema>
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>