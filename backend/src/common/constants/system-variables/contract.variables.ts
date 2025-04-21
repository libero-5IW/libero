import { SHARED_VARIABLES } from './shared.variables';

const CONTRACT_ONLY_VARIABLES = [
  {
    variableName: 'freelancer_address',
    label: 'Adresse du freelance',
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
    label: 'Montant total (HT)',
    type: 'number',
    required: true,
  },
  {
    variableName: 'payment_terms',
    label: 'Modalités de paiement',
    type: 'string',
    required: true,
  },
  {
    variableName: 'freelancer_signature',
    label: 'Signature du freelance',
    type: 'string',
    required: true,
  },
  {
    variableName: 'client_signature',
    label: 'Signature du client',
    type: 'string',
    required: true,
  },
];

export const CONTRACT_VARIABLES_SYSTEM = [
  ...SHARED_VARIABLES,
  ...CONTRACT_ONLY_VARIABLES,
].map((v) => ({
  ...v,
  id: 'systemVariable',
}));
