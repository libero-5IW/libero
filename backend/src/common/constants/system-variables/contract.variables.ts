import { SHARED_VARIABLES } from './shared.variables';

export const CONTRACT_VARIABLES = [
  {
    variableName: 'contract_date',
    label: 'Date du contrat',
    type: 'date',
    required: true,
  },
  {
    variableName: 'contract_number',
    label: 'Numéro du contrat',
    type: 'number',
    required: true,
  },
  {
    variableName: 'start_date',
    label: 'Date de début',
    type: 'date',
    required: true,
  },
  {
    variableName: 'end_date',
    label: 'Date de fin',
    type: 'date',
    required: false,
  },
  {
    variableName: 'payment_terms',
    label: 'Modalités de paiement',
    type: 'string',
    required: false,
  },
];

export const CONTRACT_VARIABLES_SYSTEM = [
  ...SHARED_VARIABLES,
  ...CONTRACT_VARIABLES,
].map((v) => ({
  ...v,
  id: 'systemVariable',
}));
