import { CONTRACT_VARIABLES_SYSTEM } from '../system-variables';

export const DEFAULT_CONTRACT_TEMPLATE = {
  name: 'Contrat par défaut',
  contentHtml: `
    <h1>Contrat de prestation</h1>
    <p><strong>Freelance :</strong> {{freelancer_name}}, {{freelancer_address}}</p>
    <p><strong>Client :</strong> {{client_name}}, {{client_address}}</p>
    <p><strong>Prestation :</strong> {{prestation_description}}</p>
    <p><strong>Montant :</strong> {{total_amount}} € HT</p>
    <p><strong>Modalités de paiement :</strong> {{payment_terms}}</p>
    <p><strong>Signature Freelance :</strong> {{freelancer_signature}}</p>
    <p><strong>Signature Client :</strong> {{client_signature}}</p>
  `,
  variables: CONTRACT_VARIABLES_SYSTEM,
};
