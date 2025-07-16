import { PrismaClient, VariableType } from '@prisma/client';

export async function seedDefaultInvoiceTemplate(prisma: PrismaClient) {
  const template = {
    id: 'defaultTemplate',
    name: 'Modèle de base - Facture',
    userId: null,
    contentHtml: `
        <div style="padding-right: 40px;">

        <b>Facture n°</b>{{invoice_number}}

        <br /><br />
        <p>
        Émise le : {{issue_date}}<br />
        Échéance : {{due_date}}
        </p>
        <br />
        <p>
        Établie par : {{freelancer_name}}, {{freelancer_address}}<br />
        SIRET : {{freelancer_siret}}
        </p>
        <br />
        <p>
        Destinataire : {{client_name}}, {{client_address}}
        </p>
        <br />
        <p>
        <b>Prestation réalisée :</b><br />
        {{prestation_description}}
        </p>
        <br /><br />
        <p>
        <b>Montant HT :</b> {{total_amount}} €
        </p>
        <br /><br />
        <p>
        Conditions de paiement : {{payment_terms}}<br />
        Pénalités de retard : {{late_penalty}}<br />
        Détail TVA : {{tva_detail}}
        </p>
        <br /><br />
        </div>
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
