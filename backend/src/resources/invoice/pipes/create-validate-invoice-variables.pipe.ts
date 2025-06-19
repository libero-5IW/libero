import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { VariableType } from 'src/common/enums/variable-type.enum';
import { CreateInvoiceVariableValueDto } from '../dto/create-invoice-variable-value.dto';
import { InvoiceTemplateVariableDto } from '../../invoice-template/dto/invoice-template-variable.dto';

@Injectable()
export class ValidateInvoiceOnCreatePipe<
  T extends {
    templateId?: string;
    variableValues?: CreateInvoiceVariableValueDto[];
    contentHtml?: string;
  },
> implements PipeTransform<T>
{
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: T): Promise<T> {
    const { templateId, variableValues = [] } = value;

    this.ensureTemplateIdProvided(templateId);
    const templateVariables = await this.getTemplateVariables(templateId!);
    this.validateVariables(templateVariables, variableValues);

    return value;
  }

  private ensureTemplateIdProvided(templateId?: string) {
    if (!templateId) {
      throw new BadRequestException("L'identifiant du modèle est requis.");
    }
  }

  private async getTemplateVariables(
    templateId: string,
  ): Promise<InvoiceTemplateVariableDto[]> {
    const template = await this.prisma.invoiceTemplate.findUnique({
      where: { id: templateId },
      include: { variables: true },
    });

    if (!template) {
      throw new BadRequestException(
        'Le modèle de facture spécifié est introuvable.',
      );
    }

    const systemVariables = await this.prisma.invoiceTemplateVariable.findMany({
      where: { templateId: 'defaultTemplate' },
    });

    return [...template.variables, ...systemVariables];
  }

  private validateVariables(
    templateVariables: InvoiceTemplateVariableDto[],
    submittedVariables: CreateInvoiceVariableValueDto[],
  ) {
    const valueMap = new Map(
      submittedVariables.map((v) => [v.variableName, v.value]),
    );

    for (const variable of templateVariables) {
      const { variableName, required, type } = variable;
      const rawValue = valueMap.get(variableName);

      if (required && variableName !== 'invoice_number' && this.isEmpty(rawValue)) {
        throw new BadRequestException(
          `La variable requise "${variableName}" est manquante ou vide.`,
        );
      }
      

      if (!this.isEmpty(rawValue)) {
        const isValid = this.validateValueType(rawValue!, type as VariableType);
        if (!isValid) {
          throw new BadRequestException(
            `La variable "${variableName}" n'a pas un type valide (${type}).`,
          );
        }
      }
    }
  }

  private isEmpty(value: string | undefined | null): boolean {
    return value === undefined || value === null || value === '';
  }

  private validateValueType(value: string, type: VariableType): boolean {
    switch (type) {
      case VariableType.STRING:
      case VariableType.TEXTAREA:
        return typeof value === 'string';

      case VariableType.NUMBER:
        return !isNaN(Number(value));

      case VariableType.DATE:
        return !isNaN(Date.parse(value));

      case VariableType.EMAIL:
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      case VariableType.URL:
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }

      default:
        return false;
    }
  }
}
