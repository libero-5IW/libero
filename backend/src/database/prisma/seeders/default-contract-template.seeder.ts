import { PrismaClient, VariableType } from '@prisma/client';

export async function seedDefaultContractTemplate(prisma: PrismaClient) {
  const template = {
    id: 'defaultTemplate',
    name: 'Modèle de base - Contrat',
    userId: null,
    contentHtml: `
      <div style="font-family: 'Roboto', Arial, sans-serif; color: #212121; background: #fff; border-radius: 8px; padding: 32px 24px; max-width: 800px; margin: auto;">
        <div style="border-bottom: 2px solid #3F51B5; padding-bottom: 18px; margin-bottom: 36px;">
          <span style="font-size: 2.2em; color: #3F51B5; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Contrat de prestation n°{{contract_number}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
          <div style="width: 48%;">
            <h3 style="color: #3F51B5; font-size: 1.1em; margin-bottom: 0.5em;">Freelance</h3>
            <p><strong>{{freelancer_name}}</strong></p>
            <p>{{freelancer_address}}</p>
          </div>
          <div style="width: 48%;">
            <h3 style="color: #3F51B5; font-size: 1.1em; margin-bottom: 0.5em;">Client</h3>
            <p><strong>{{client_name}}</strong></p>
            <p>{{client_address}}</p>
          </div>
        </div>
        <div style="margin-bottom: 24px;">
          <p>Date d’émission : {{issue_date}}</p>
          <p>Date de fin : {{end_date}}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.98em;">
          <thead>
            <tr>
              <th style="background: #f0f4ff; color: #3F51B5; font-weight: 600; letter-spacing: 0.5px; border: 1px solid #d1d5db; padding: 10px 14px;">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 10px 14px;">{{prestation_description}}</td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top: 32px; text-align: right;">
          <p style="font-size: 1.1em;"><strong>Montant : {{total_amount}} € HT</strong></p>
        </div>
        <div style="margin-top: 24px;">
          <p><strong>Modalités de paiement :</strong> {{payment_terms}}</p>
        </div>
        <div style="margin-top: 24px;">
          <p><strong>Signature Freelance nom signature:</strong> {{freelancer_fullname_signed}}</p>
          <p><strong>Signature Freelance date signature:</strong> {{freelancer_date_signed}}</p>
          <p><strong>Signature Freelance signature:</strong> {{freelancer_signature}}</p>
          <p><strong>Signature Client nom signature:</strong> {{client_fullname_signed}}</p>
          <p><strong>Signature Client date signature:</strong> {{client_date_signed}}</p>
          <p><strong>Signature Client signature:</strong> {{client_signature}}</p>
        </div>
      </div>
    `,
    variables: [
      {
        variableName: 'contract_number',
        label: 'Numéro du contrat',
        type: VariableType.number,
        required: true,
      },
      {
        variableName: 'freelancer_name',
        label: 'Nom du freelance',
        type: VariableType.string,
        required: true,
      },
      {
        variableName: 'freelancer_address',
        label: 'Adresse du freelance',
        type: VariableType.string,
        required: true,
      },
      {
        variableName: 'client_name',
        label: 'Nom du client',
        type: VariableType.string,
        required: true,
      },
      {
        variableName: 'client_address',
        label: 'Adresse du client',
        type: VariableType.string,
        required: true,
      },
      {
        variableName: 'prestation_description',
        label: 'Description de la prestation',
        type: VariableType.string,
        required: true,
      },
      {
        variableName: 'issue_date',
        label: 'Date d’émission',
        type: VariableType.date,
        required: true,
      },
      {
        variableName: 'end_date',
        label: 'Date de fin de contrat',
        type: VariableType.date,
        required: true,
      },
      {
        variableName: 'total_amount',
        label: 'Montant total HT',
        type: VariableType.number,
        required: true,
      },
      {
        variableName: 'payment_terms',
        label: 'Modalités de paiement',
        type: VariableType.string,
        required: true,
      },
      {
        variableName: 'freelancer_fullname_signed',
        label: 'Nom complet du freelance',
        type: VariableType.string,
        required: true,
      },
      {
        variableName: 'freelancer_date_signed',
        label: 'Date de signature du freelance',
        type: VariableType.string,
        required: true,
      },
      {
        variableName: 'freelancer_signature',
        label: 'Signature du freelance',
        type: VariableType.string,
        required: true,
      },
      {
        variableName: 'client_fullname_signed',
        label: 'Nom complet du client',
        type: VariableType.string,
        required: true,
      },
      {
        variableName: 'client_date_signed',
        label: 'Date de signature du client',
        type: VariableType.string,
        required: true,
      },
      {
        variableName: 'client_signature',
        label: 'Signature du client',
        type: VariableType.string,
        required: true,
      },
    ],
  };

  const existing = await prisma.contractTemplate.findUnique({
    where: { id: template.id },
  });
  if (!existing) {
    await prisma.contractTemplate.create({
      data: {
        id: template.id,
        name: template.name,
        contentHtml: template.contentHtml,
        userId: template.userId,
        pdfKey: '',
        previewKey: '',
        variables: {
          create: template.variables.map((v) => ({
            variableName: v.variableName,
            label: v.label,
            type: v.type,
            required: v.required,
          })),
        },
      },
    });
  }

  console.log('Template de contrat par défaut inséré avec succès !');
}
