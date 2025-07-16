import { PrismaClient, VariableType } from '@prisma/client';

export async function seedDefaultContractTemplate(prisma: PrismaClient) {
  const template = {
    id: 'defaultTemplate',
    name: 'Modèle de base - Contrat',
    userId: null,
    contentHtml: `
<div style="padding-right: 40px;">

<b>Contrat de prestation n°</b>{{contract_number}}

<br /><br />
<p>
Entre les soussignés :<br />
{{freelancer_name}}, domicilié(e) à {{freelancer_address}}, ci-après désigné(e) "le Freelance",<br />
et {{client_name}}, situé(e) à {{client_address}}, ci-après désigné(e) "le Client".
</p>
<br />
<p>
Il a été convenu ce qui suit :

<br />

Le Freelance s’engage à réaliser pour le Client la prestation suivante :<br />
{{prestation_description}}
</p>
<br /><br />
<p>
Le présent contrat prend effet à compter du {{issue_date}} et prendra fin le {{end_date}}.
</p>
<br /><br />
<p>
Le montant total de la prestation est de {{total_amount}} € HT, selon les modalités de paiement suivantes :<br />
{{payment_terms}}
</p>
<br />
<p>
Fait en deux exemplaires, à {{client_address}}, le {{issue_date}}.
</p>
<br /><br />
<p>
<b>Freelance</b><br />
{{freelancer_fullname_signed}}<br />
{{freelancer_date_signed}}<br />
{{freelancer_signature}}
</p>
<br /><br />
<p>
<b>Client</b><br />
{{client_fullname_signed}}<br />
{{client_date_signed}}<br />
{{client_signature}}
</p>
<br /><br />

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
