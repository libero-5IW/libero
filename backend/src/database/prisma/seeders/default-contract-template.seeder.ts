import { PrismaClient, VariableType } from '@prisma/client';

export async function seedDefaultContractTemplate(prisma: PrismaClient) {
  const template = {
    id: 'defaultTemplate',
    name: 'Modèle de base - Contrat',
    userId: null,
    contentHtml: `
        <h1>Contrat de prestation</h1>
        <p><strong>Freelance :</strong> {{freelancer_name}}, {{freelancer_address}}</p>
        <p><strong>Client :</strong> {{client_name}}, {{client_address}}</p>
        <p><strong>Prestation :</strong> {{prestation_description}}</p>
        <p><strong>Date d’émission :</strong> {{issue_date}}</p>
        <p><strong>Date de fin :</strong> {{end_date}}</p>
        <p><strong>Montant :</strong> {{total_amount}} € HT</p>
        <p><strong>Modalités de paiement :</strong> {{payment_terms}}</p>
        <p><strong>Signature Freelance :</strong> {{freelancer_signature}}</p>
        <p><strong>Signature Client :</strong> {{client_signature}}</p>
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
        variableName: 'freelancer_signature',
        label: 'Signature du freelance',
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
