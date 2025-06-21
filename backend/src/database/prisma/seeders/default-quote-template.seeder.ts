import { PrismaClient, VariableType } from '@prisma/client';

export async function seedDefaultQuoteTemplate(prisma: PrismaClient) {
  const user = await prisma.user.findFirst();
  if (!user) {
    throw new Error('No user found. Please seed users before seeding quote templates.');
  }
  const template = {
    id: 'defaultTemplate',
    userId: null,
    name: 'Modèle de base - Devis',
    contentHtml: `
        <h1>Devis n°{{quote_number}}</h1>
        <br>
        <p><strong>Freelance :</strong> {{freelancer_name}}, {{freelancer_address}}</p>
        <p><strong>SIRET :</strong> {{freelancer_siret}}</p>
        <br>
        <p><strong>Client :</strong> {{client_name}}, {{client_address}}</p>
        <p><strong>Prestation :</strong> {{prestation_description}}</p>
        <p>Date : {{quote_date}}</p>
        <p>Valide jusqu'au : {{valid_until}}</p>
        <br>
        <p><strong>Total HT : {{total_amount}} €</strong></p>
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
