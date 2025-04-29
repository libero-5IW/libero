import { SHARED_VARIABLES } from './shared.variables';

export const INVOICE_VARIABLES = [
  {
    variableName: 'invoice_number',
    label: 'Numéro de la facture',
    type: 'number',
    required: true,
  },
  {
    variableName: 'issue_date',
    label: 'Date d’émission',
    type: 'date',
    required: true,
  },
  {
    variableName: 'due_date',
    label: 'Date d’échéance',
    type: 'date',
    required: true,
  },
  {
    variableName: 'freelancer_address',
    label: 'Adresse du freelance',
    type: 'string',
    required: true,
  },
  {
    variableName: 'freelancer_siret',
    label: 'SIRET du freelance',
    type: 'string',
    required: true,
  },
  {
    variableName: 'client_address',
    label: 'Adresse du client',
    type: 'string',
    required: true,
  },
  {
    variableName: 'prestation_description',
    label: 'Description de la prestation',
    type: 'string',
    required: true,
  },
  {
    variableName: 'total_amount',
    label: 'Montant total HT',
    type: 'number',
    required: true,
  },
  {
    variableName: 'late_penalty',
    label: 'Pénalités de retard',
    type: 'string',
    required: true,
  },
  {
    variableName: 'payment_terms',
    label: 'Modalités de paiement',
    type: 'string',
    required: true,
  },
  {
    variableName: 'tva_detail',
    label: 'Détail TVA ou mention 293B',
    type: 'string',
    required: true,
  },
];

export const INVOICE_VARIABLES_SYSTEM = [
  ...SHARED_VARIABLES,
  ...INVOICE_VARIABLES,
].map((v) => ({
  ...v,
  id: 'systemVariable',
}));
