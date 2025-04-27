import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceTemplateService } from '../invoice-template/invoice-template.service';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoiceTemplateService: InvoiceTemplateService,
  ) {}

  async createInvoiceFromTemplate(dto: CreateInvoiceDto, userId: string) {
    const template = await this.invoiceTemplateService.findOne(dto.templateId);
    if (!template) throw new NotFoundException('Template de facture introuvable');

    const expectedVariables = template.variables.map(v => v.variableName);
    const missingVars = expectedVariables.filter(v => !(v in dto.variables));

    if (missingVars.length > 0) {
      throw new BadRequestException(`Variables manquantes : ${missingVars.join(', ')}`);
    }

    let generatedHtml = template.contentHtml;
    for (const [key, value] of Object.entries(dto.variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      generatedHtml = generatedHtml.replace(regex, value);
    }

    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { userId },
      orderBy: { number: 'desc' },
    });
    const nextNumber = lastInvoice ? lastInvoice.number + 1 : 1;

    const invoice = await this.prisma.invoice.create({
      data: {
        number: nextNumber,
        templateId: dto.templateId,
        userId,
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

  async findById(id: string) {
    return await this.prisma.invoice.findUnique({
      where: { id },
      include: { variableValues: true },
    });
  }

  async findAll() {
    return await this.prisma.invoice.findMany({
      include: { variableValues: true },
    });
  }

  async getNextInvoiceNumber() {
    const lastInvoice = await this.prisma.invoice.findFirst({
      orderBy: { number: 'desc' },
    });
    const nextNumber = lastInvoice ? lastInvoice.number + 1 : 1;
    return { nextNumber };
  }  
  
}
