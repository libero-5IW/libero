import { QUOTE_VARIABLES_SYSTEM } from '../system-variables/quote.variables';

export const DEFAULT_QUOTE_TEMPLATE = {
  id: 'defaultTemplate',
  name: 'Modèle de base - Devis',
  contentHtml: `
    <h1>Devis n°{{quote_number}}</h1>
    <br>
    <p>Client : {{client_name}}</p>
    <p>Freelance : {{freelancer_name}}</p>
    <p>Date : {{quote_date}}</p>
    <p>Valide jusqu’au : {{valid_until}}</p>
    <br>
    <p><strong>Total HT : {{total_amount}} €</strong></p>
  `,
  variables: QUOTE_VARIABLES_SYSTEM,
};
