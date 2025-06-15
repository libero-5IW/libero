import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { plainToInstance } from 'class-transformer';
import { InvoiceEntity } from './entities/invoice.entity';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { InvoiceTemplateService } from '../invoice-template/invoice-template.service';
import { InvoiceStatus, VariableType } from '@prisma/client';
import { generateNextNumber } from 'src/common/utils/generate-number.util';
import { CreateInvoiceVariableValueDto } from './dto/create-invoice-variable-value.dto';
import { InvoiceTemplateVariableEntity } from '../invoice-template/entities/invoice-template-variable.entity';
import { extractVariablesFromHtml } from 'src/common/utils/variable-parser.util';

@Injectable()
export class InvoiceService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly invoiceTemplateService: InvoiceTemplateService,
  ) {}

  async create(
    userId: string,
    dto: CreateInvoiceDto,
  ): Promise<InvoiceEntity> {
    
    const { clientId, templateId, generatedHtml, dueDate, variableValues } = dto;

    await this.userService.getUserOrThrow(userId);
    await this.clientService.getClientOrThrow(clientId, userId);

    const template = await this.invoiceTemplateService.findOne(templateId, userId);
    const nextNumber = await this.getNextInvoiceNumber(userId);
    

    const invoice = await this.prisma.invoice.create({
      data: {
        number: nextNumber,
        template: { connect: { id: templateId } },
        user: { connect: { id: userId } },
        client: { connect: { id: clientId } },
        status: InvoiceStatus.draft,
        generatedHtml,
        dueDate: new Date(dueDate),
        issuedAt: null,
        variableValues: {
          create: this.mapVariableWithTemplateData(
            variableValues,
            template.variables,
            generatedHtml,
          ),
        },
      },
      include: { variableValues: true },
    });

    return plainToInstance(InvoiceEntity, invoice, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async findAll(userId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { userId },
      include: { variableValues: true },
    });

    return plainToInstance(InvoiceEntity, invoices, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async findOne(id: string, userId: string) {
    const invoice = await this.getInvoiceOrThrow(id, userId);
    return plainToInstance(InvoiceEntity, invoice);
  }

  async update(id: string, userId: string, dto: UpdateInvoiceDto) {
    const { variableValues, ...otherData } = dto;
    const existing = await this.getInvoiceOrThrow(id, userId);

    if (existing.status !== InvoiceStatus.draft) {
      throw new BadRequestException('Seules les factures en brouillon peuvent être modifiées.');
    }

    for (const variable of variableValues ?? []) {
      await this.prisma.invoiceVariableValue.update({
        where: {
          invoiceId_variableName: {
            invoiceId: id,
            variableName: variable.variableName,
          },
        },
        data: { value: variable.value },
      });
    }

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: { ...otherData },
      include: { variableValues: true },
    });

    return plainToInstance(InvoiceEntity, updated, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async remove(id: string, userId: string) {
    await this.getInvoiceOrThrow(id, userId);
    const deleted = await this.prisma.invoice.delete({ where: { id } });
    return plainToInstance(InvoiceEntity, deleted);
  }

  async getNextInvoiceNumber(userId: string) {
    return generateNextNumber('invoice', userId);
  }

  private async getInvoiceOrThrow(id: string, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, userId },
      include: { variableValues: true },
    });
    if (!invoice) {
      throw new NotFoundException('Facture non trouvée.');
    }
    return invoice;
  }

  private mapVariableWithTemplateData(
    submitted: CreateInvoiceVariableValueDto[],
    templateVars: InvoiceTemplateVariableEntity[],
    html: string,
  ) {
    const htmlVars = extractVariablesFromHtml(html);
    const templateMap = new Map(
      templateVars
        .filter((v) => htmlVars.includes(v.variableName))
        .map((v) => [v.variableName, v]),
    );

    return submitted
      .filter((v) => htmlVars.includes(v.variableName))
      .map((v) => {
        const templateVar = templateMap.get(v.variableName);
        if (!templateVar) {
          throw new Error(`Variable ${v.variableName} non définie dans le template`);
        }
        return {
          variableName: v.variableName,
          value: v.value,
          label: templateVar.label,
          type: templateVar.type as VariableType,
          required: templateVar.required,
        };
      });
  }
}
