import { SHARED_VARIABLES } from './shared.variables';

export const QUOTE_VARIABLES = [
  {
    variableName: 'quote_date',
    label: 'Date du devis',
    type: 'date',
    required: true,
  },
  {
    variableName: 'quote_number',
    label: 'Numéro du devis',
    type: 'number',
    required: true,
  },
  {
    variableName: 'total_amount',
    label: 'Montant total HT',
    type: 'number',
    required: true,
  },
  {
    variableName: 'valid_until',
    label: 'Date de validité',
    type: 'date',
    required: true,
  },
];

export const QUOTE_VARIABLES_SYSTEM = [
  ...SHARED_VARIABLES,
  ...QUOTE_VARIABLES,
].map((v) => ({
  ...v,
  id: 'systemVariable',
}));
