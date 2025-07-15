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
<div style="padding-right: 40px;">

<b>Devis n°</b>{{quote_number}}

<br /><br />
<p>
Je soussigné(e) {{freelancer_name}}, domicilié(e) à {{freelancer_address}}, 
immatriculé(e) sous le numéro SIRET {{freelancer_siret}}, propose au client {{client_name}}, 
domicilié(e) à {{client_address}}, la prestation suivante :
</p>
<br />
<p>
{{prestation_description}}
</p>
<br /><br />
<p>
Le présent devis est établi en date du {{quote_date}} et reste valable jusqu’au {{valid_until}}.
</p>
<br /><br />
<p>
<b>Montant total HT :</b> {{total_amount}} € 
</p>
<br /><br />
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
