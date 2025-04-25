import { INVOICE_VARIABLES_SYSTEM } from '../system-variables/invoice.variables';

export const DEFAULT_INVOICE_TEMPLATE = {
  name: 'Modèle de base - Facture',
  contentHtml: `
    <h1>Facture n°{{invoice_number}}</h1>
    <br>
    <p><strong>Émise le :</strong> {{issue_date}}</p>
    <p><strong>Échéance :</strong> {{due_date}}</p>
    <br>
    <p><strong>Freelance :</strong> {{freelancer_name}}, {{freelancer_address}}</p>
    <p><strong>SIRET :</strong> {{freelancer_siret}}</p>
    <br>
    <p><strong>Client :</strong> {{client_name}}, {{client_address}}</p>
    <br>
    <p><strong>Prestation :</strong> {{prestation_description}}</p>
    <p><strong>Montant HT :</strong> {{total_amount}} €</p>
    <br>
    <p><strong>Conditions de paiement :</strong> {{payment_terms}}</p>
    <p><strong>Pénalités de retard :</strong> {{late_penalty}}</p>
    <br>
    <p><strong>Détail TVA :</strong> {{tva_detail}}</p>
  `,
  variables: INVOICE_VARIABLES_SYSTEM,
};
