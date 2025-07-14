import { PrismaClient, VariableType } from '@prisma/client';

export async function seedDefaultQuoteTemplate(prisma: PrismaClient) {
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error(
      'No user found. Please seed users before seeding quote templates.',
    );
  }
  const template = {
    id: 'defaultTemplate',
    userId: null,
    name: 'Modèle de base - Devis',
    contentHtml: `
      <div style="font-family: 'Roboto', Arial, sans-serif; color: #212121; background: #fff; border-radius: 8px; padding: 32px 24px; max-width: 800px; margin: auto;">
        <div style="border-bottom: 2px solid #3F51B5; padding-bottom: 18px; margin-bottom: 36px;">
          <span style="font-size: 2.2em; color: #3F51B5; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Devis n°{{quote_number}}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
          <div style="width: 48%;">
            <h3 style="color: #3F51B5; font-size: 1.1em; margin-bottom: 0.5em;">Freelance</h3>
            <p><strong>{{freelancer_name}}</strong></p>
            <p>{{freelancer_address}}</p>
            <p>SIRET : {{freelancer_siret}}</p>
          </div>
          <div style="width: 48%;">
            <h3 style="color: #3F51B5; font-size: 1.1em; margin-bottom: 0.5em;">Client</h3>
            <p><strong>{{client_name}}</strong></p>
            <p>{{client_address}}</p>
          </div>
        </div>
        <div style="margin-bottom: 24px;">
          <p>Date : {{quote_date}}</p>
          <p>Valide jusqu'au : {{valid_until}}</p>
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
          <p style="font-size: 1.1em;"><strong>Total HT : {{total_amount}} €</strong></p>
        </div>
      </div>
    `,
    variables: [
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
        variableName: 'freelancer_siret',
        label: 'SIRET du freelance',
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
        variableName: 'quote_date',
        label: 'Date du devis',
        type: VariableType.date,
        required: true,
      },
      {
        variableName: 'quote_number',
        label: 'Numéro du devis',
        type: VariableType.number,
        required: true,
      },
      {
        variableName: 'total_amount',
        label: 'Montant total HT',
        type: VariableType.number,
        required: true,
      },
      {
        variableName: 'valid_until',
        label: 'Date de validité',
        type: VariableType.date,
        required: true,
      },
      {
        variableName: 'prestation_description',
        label: 'Description de la prestation',
        type: VariableType.string,
        required: false,
      },
    ],
  };

  const existing = await prisma.quoteTemplate.findUnique({
    where: { id: template.id },
  });
  if (!existing) {
    await prisma.quoteTemplate.create({
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

  console.log('Template de devis par défaut inséré avec succès !');
}
