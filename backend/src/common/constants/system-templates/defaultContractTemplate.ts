import { CONTRACT_VARIABLES_SYSTEM } from '../system-variables/contract.variables';

export const DEFAULT_CONTRACT_TEMPLATE = {
  name: 'Modèle de base - Contrat',
  contentHtml: `
    <h1>Contrat n°{{contract_number}}</h1>
    <br>
    <p>Client : {{client_name}}</p>
    <p>Freelance : {{freelancer_name}}</p>
    <p>Date du contrat : {{contract_date}}</p>
    <p>Date de début : {{start_date}}</p>
    <p>Date de fin : {{end_date}}</p>
    <p>Modalités de paiement : {{payment_terms}}</p>
  `,
  variables: CONTRACT_VARIABLES_SYSTEM,
};
