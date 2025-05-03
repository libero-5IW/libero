import { RegisterDataSchema } from '@/schemas/user.schema';
import { ZodSchema } from 'zod';

export function zodFieldRule(schema: ZodSchema) {
  return (value: any) => {
    const result = schema.safeParse(value);
    return result.success || result.error.issues[0]?.message || 'Champ invalide';
  };
}

export const firstNameRules = () => [
  zodFieldRule(RegisterDataSchema.shape.firstName),
];

export const lastNameRules = () => [
  zodFieldRule(RegisterDataSchema.shape.lastName),
];

export const emailRules = () => [
  zodFieldRule(RegisterDataSchema.shape.email),
];

export const passwordRulesZod = () => [
  zodFieldRule(RegisterDataSchema.shape.password),
];

export const addressLineRules = () => [
  zodFieldRule(RegisterDataSchema.shape.addressLine),
];

export const postalCodeRules = () => [
  zodFieldRule(RegisterDataSchema.shape.postalCode),
];

export const cityRules = () => [
  zodFieldRule(RegisterDataSchema.shape.city),
];

export const countryRules = () => [
    (v: string) => !!v || 'Le pays est requis'
  ];
  
export const legalStatusSelectRules = () => [
    (v: string) => !!v || 'Le statut juridique est requis'
];

export const legalStatusRules = () => [
  zodFieldRule(RegisterDataSchema.shape.legalStatus),
];

export const siretRules = () => [
  zodFieldRule(RegisterDataSchema.shape.siret),
];

export const tvaNumberRules = () => [
  zodFieldRule(RegisterDataSchema.shape.tvaNumber),
];

export const companyNameRules = () => [
  zodFieldRule(RegisterDataSchema.shape.companyName),
];
