import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceTemplateService } from '../invoice-template/invoice-template.service';
import { generateNextNumber } from 'src/common/utils/generate-number.util';
import { INVOICE_STATUS } from 'src/common/constants/status/invoice-status.constant';



@Injectable()
export class InvoiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invoiceTemplateService: InvoiceTemplateService,
  ) {}

  async createInvoiceFromTemplate(createInvoiceDto: CreateInvoiceDto, userId: string) {
    const template = await this.invoiceTemplateService.findOne(createInvoiceDto.templateId);
    if (!template) throw new NotFoundException('Template de facture introuvable');
  
    let generatedHtml = template.contentHtml;
    for (const [key, value] of Object.entries(createInvoiceDto.variables)) {
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
        templateId: createInvoiceDto.templateId,
        userId,
        clientId: createInvoiceDto.clientId,
        issuedAt: createInvoiceDto.issuedAt,
        dueDate: createInvoiceDto.dueDate,
        generatedHtml,
        status: INVOICE_STATUS.DRAFT,
        variableValues: {
          create: this.mapVariableData(createInvoiceDto.variables),
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

  async getInvoiceOrThrow(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { variableValues: true },
    });
    if (!invoice) {
      throw new NotFoundException('Facture non trouvée');
    }
    return invoice;
  }  

  async findAll() {
    return await this.prisma.invoice.findMany({
      include: { variableValues: true },
    });
  }

  async getNextInvoiceNumber(userId: string) {
    const nextNumber = await generateNextNumber('invoice', userId);
    return { nextNumber };
  }

  private mapVariableData(variables: Record<string, string>) {
    return Object.entries(variables).map(([variableName, value]) => ({
      variableName,
      value,
    }));
  }  
  
}
