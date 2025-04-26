import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service'
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceTemplateService } from '../invoice-template/invoice-template.service';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoiceTemplateService: InvoiceTemplateService,
  ) {}

  /**
   * Créer une facture à partir d'un template précis
   */
  async createInvoiceFromTemplate(dto: CreateInvoiceDto) {
    // 1. Récupérer le template
    const template = await this.invoiceTemplateService.findOne(dto.templateId);

    if (!template) {
      throw new NotFoundException('Template de facture introuvable');
    }

    // 2. Vérifier que toutes les variables requises sont présentes
    const expectedVariables = template.variables.map(v => v.variableName);
    const missingVars = expectedVariables.filter(v => !(v in dto.variables));

    if (missingVars.length > 0) {
      throw new BadRequestException(`Variables manquantes : ${missingVars.join(', ')}`);
    }

    // 3. Remplacer les variables dans le contentHtml
    let generatedHtml = template.contentHtml;
    for (const [key, value] of Object.entries(dto.variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      generatedHtml = generatedHtml.replace(regex, value);
    }

    // 4. Générer le numéro de facture (auto-incrément par user)
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { userId: dto.userId },
      orderBy: { number: 'desc' },
    });
    const nextNumber = lastInvoice ? lastInvoice.number + 1 : 1;

    // 5. Sauvegarder la facture en BDD
    const invoice = await this.prisma.invoice.create({
      data: {
        number: nextNumber,
        templateId: dto.templateId,
        userId: dto.userId,
        clientId: dto.clientId,
        issuedAt: dto.issuedAt,
        dueDate: dto.dueDate,
        generatedHtml,
        status: 'draft',
        variableValues: {
          create: Object.entries(dto.variables).map(([variableName, value]) => ({
            variableName,
            value,
          })),
        },
      },
      include: { variableValues: true },
    });

    return invoice;
  }

  /**
   * Récupérer une facture par ID
   */
  async findById(id: string) {
    return await this.prisma.invoice.findUnique({
      where: { id },
      include: { variableValues: true },
    });
  }

  /**
   * Lister toutes les factures
   */
  async findAll() {
    return await this.prisma.invoice.findMany({
      include: { variableValues: true },
    });
  }
}
