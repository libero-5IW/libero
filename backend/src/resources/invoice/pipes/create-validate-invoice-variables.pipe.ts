import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { InvoiceTemplateVariable } from '@prisma/client';

@Injectable()
export class ValidateInvoiceOnCreatePipe
  implements PipeTransform<CreateInvoiceDto>
{
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: CreateInvoiceDto): Promise<CreateInvoiceDto> {
    const { variablesValues = {} } = value;

    const systemVariables = await this.getSystemVariables();

    this.validateRequiredSystemVariables(systemVariables, variablesValues);
    this.validateDates(variablesValues);
    this.validateSiret(variablesValues);
    this.validateTotalAmount(variablesValues);

    return value;
  }

  private async getSystemVariables(): Promise<InvoiceTemplateVariable[]> {
    return this.prisma.invoiceTemplateVariable.findMany({
      where: {
        templateId: 'defaultTemplate',
      },
    });
  }

  private validateRequiredSystemVariables(
    systemVars: InvoiceTemplateVariable[],
    providedVars: Record<string, string>,
  ) {
    const required = systemVars
      .filter((v) => v.required)
      .map((v) => v.variableName);
    const missing = required.filter((key) => !(key in providedVars));

    if (missing.length > 0) {
      throw new BadRequestException(
        `Variables système manquantes : ${missing.join(', ')}`,
      );
    }
  }

  private validateDates(variables: Record<string, string>) {
    const issueDate = new Date(variables['issue_date']);
    const dueDate = new Date(variables['due_date']);

    if (isNaN(issueDate.getTime()) || isNaN(dueDate.getTime())) {
      throw new BadRequestException('Les dates fournies sont invalides.');
    }

    if (dueDate <= issueDate) {
      throw new BadRequestException(
        'La date d’échéance doit être postérieure à la date d’émission.',
      );
    }
  }

  private validateSiret(variables: Record<string, string>) {
    const siret = variables['freelancer_siret'];

    if (!/^\d{14}$/.test(siret)) {
      throw new BadRequestException(
        'Le numéro SIRET doit contenir exactement 14 chiffres.',
      );
    }
  }

  private validateTotalAmount(variables: Record<string, string>) {
    const total = parseFloat(variables['total_amount']);

    if (isNaN(total) || total <= 0) {
      throw new BadRequestException(
        'Le montant total HT doit être un nombre positif.',
      );
    }
  }
}
