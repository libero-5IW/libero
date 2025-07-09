import { PrismaClient, VariableType } from '@prisma/client';

export async function seedDefaultInvoiceTemplate(prisma: PrismaClient) {
  const template = {
    id: 'defaultTemplate',
    name: 'Modèle de base - Facture',
    userId: null,
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
    variables: [
      {
        variableName: 'invoice_number',
        label: 'Numéro de la facture',
        type: VariableType.number,
        required: true,
      },
      {
        variableName: 'issue_date',
        label: `Date d'émission`,
        type: VariableType.date,
        required: true,
      },
      {
        variableName: 'due_date',
        label: `Date d'échéance`,
        type: VariableType.date,
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
        variableName: 'prestation_description',
        label: 'Description de la prestation',
        type: VariableType.string,
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
        variableName: 'late_penalty',
        label: 'Pénalités de retard',
        type: VariableType.string,
        required: true,
      },
      {
        variableName: 'tva_detail',
        label: 'Détail TVA ou mention 293B',
        type: VariableType.string,
        required: true,
      },
    ],
  };

  const existing = await prisma.invoiceTemplate.findUnique({
    where: { id: template.id },
  });
  if (!existing) {
    await prisma.invoiceTemplate.create({
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

  console.log('Template de facture par défaut inséré avec succès !');
}
