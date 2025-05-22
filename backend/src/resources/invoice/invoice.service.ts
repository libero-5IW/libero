import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceTemplateService } from '../invoice-template/invoice-template.service';
import { generateNextNumber } from 'src/common/utils/generate-number.util';
import { VariableType } from 'src/common/enums/variable-type.enum';
import { CreateInvoiceVariableValueDto } from './dto/create-invoice-variable-value.dto';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { InvoiceEntity } from './entities/invoice.entity';
import { plainToInstance } from 'class-transformer';
import { InvoiceTemplateVariableEntity } from '../invoice-template/entities/invoice-template-variable.entity';
import { InvoiceStatus } from './enums/invoice-status.enum';

@Injectable()
export class InvoiceService {
  constructor(
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly prisma: PrismaService,
    private readonly invoiceTemplateService: InvoiceTemplateService,
  ) {}

  async createInvoiceFromTemplate(
    createInvoiceDto: CreateInvoiceDto,
    userId: string,
  ) {
    const {
      clientId,
      templateId,
      generatedHtml,
      dueDate,
      issuedAt,
      variablesValues,
    } = createInvoiceDto;

    await this.userService.getUserOrThrow(userId);
    await this.clientService.getClientOrThrow(clientId, userId);
    const template = await this.invoiceTemplateService.findOne(
      templateId,
      userId,
    );

    let contentHtml = generatedHtml;
    for (const { variableName, value } of variablesValues) {
      const regex = new RegExp(`{{${variableName}}}`, 'g');
      contentHtml = contentHtml.replace(regex, value);
    }

    const nextNumber = await this.getNextInvoiceNumber(userId);

    const invoice = await this.prisma.invoice.create({
      data: {
        number: nextNumber,
        templateId: createInvoiceDto.templateId,
        userId,
        clientId,
        issuedAt,
        dueDate,
        generatedHtml: contentHtml,
        status: InvoiceStatus.draft,
        variableValues: {
          create: this.mapVariableWithTemplateData(
            variablesValues,
            template.variables,
          ),
        },
      },
      include: { variableValues: true },
    });

    return plainToInstance(InvoiceEntity, invoice);
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
    return generateNextNumber('invoice', userId);
  }

  private mapVariableWithTemplateData(
    submittedVariables: CreateInvoiceVariableValueDto[],
    templateVariables: InvoiceTemplateVariableEntity[],
  ) {
    const templateVariableMap = new Map(
      templateVariables.map((variable) => [variable.variableName, variable]),
    );

    return submittedVariables.map((sub) => {
      const templateVariable = templateVariableMap.get(sub.variableName);
      if (!templateVariable) {
        throw new Error(
          `Variable ${sub.variableName} non définie dans le template`,
        );
      }

      return {
        variableName: sub.variableName,
        value: sub.value,
        label: templateVariable.label,
        type: templateVariable.type as VariableType,
        required: templateVariable.required,
      };
    });
  }
}
