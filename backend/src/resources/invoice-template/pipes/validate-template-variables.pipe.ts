import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { InvoiceTemplateVariableDto } from '../dto/invoice-template-variable.dto';
import { VariableType } from 'src/common/enums/variable-type.enum';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { InvoiceTemplateVariableEntity } from '../entities/invoice-template-variable.entity';
import { extractVariablesFromHtml } from 'src/common/utils/variable-parser.util';

@Injectable()
export class ValidateTemplateVariablesPipe<
  T extends {
    id?: string;
    name?: string;
    variables?: InvoiceTemplateVariableDto[];
    contentHtml?: string;
  },
> implements PipeTransform<T>
{
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: T): Promise<T> {
    const { id, name, variables = [], contentHtml = '' } = value;

    const existing = await this.prisma.invoiceTemplate.findFirst({
      where: {
        name: name?.trim(),
        NOT: id ? { id } : undefined,
      },
    });

    if (existing) {
      if (name === 'Modèle de base - Facture') {
        throw new BadRequestException(
          `Le nom de modèle "${name}" est réservé. Veuillez choisir un autre nom.`,
        );
      } else {
        throw new BadRequestException(
          `Un modèle avec le nom "${name}" existe déjà. Veuillez choisir un autre nom.`,
        );
      }
    }

    const systemVariables = await this.prisma.invoiceTemplateVariable.findMany({
      where: { templateId: 'defaultTemplate' },
    });

    this.ensureUniqueAndNonSystemVariables(variables, systemVariables);
    this.ensureValidVariableTypes(variables);
    this.ensureRequiredVariablesInHtml(variables, contentHtml, systemVariables);

    return value;
  }

  private ensureUniqueAndNonSystemVariables(
    variables: InvoiceTemplateVariableDto[],
    systemVariables: InvoiceTemplateVariableEntity[],
  ) {
    const seen = new Set<string>();

    for (const variable of variables) {
      const variableName = variable.variableName;
      const isSystemInvoiceVariable = systemVariables.some(
        (v) => v.variableName === variableName,
      );

      if (seen.has(variableName) || isSystemInvoiceVariable) {
        throw new BadRequestException(
          `La variable "${variableName}" est définie plusieurs fois.`,
        );
      }

      seen.add(variableName);
    }
  }

  private ensureValidVariableTypes(variables: InvoiceTemplateVariableDto[]) {
    const allowedTypes = Object.values(VariableType);
    for (const variable of variables) {
      if (!allowedTypes.includes(variable.type as VariableType)) {
        throw new BadRequestException(
          `Le type "${variable.type}" de la variable "${variable.variableName}" est invalide. Types autorisés : ${allowedTypes.join(', ')}`,
        );
      }
    }
  }

  private ensureRequiredVariablesInHtml(
    variables: InvoiceTemplateVariableDto[],
    contentHtml: string,
    systemVariables: InvoiceTemplateVariableEntity[],
  ) {
    const requiredVariables = [
      ...variables.filter((v) => v.required).map((v) => v.variableName),
      ...systemVariables.filter((v) => v.required).map((v) => v.variableName),
    ];

    const variableNamesInHtml = extractVariablesFromHtml(contentHtml);
    const missingVariables = requiredVariables.filter(
      (name) => !variableNamesInHtml.includes(name),
    );

    if (missingVariables.length) {
      throw new BadRequestException(
        `Le contenu HTML ne contient pas les variables requises suivantes : ${missingVariables.join(', ')}`,
      );
    }
  }
}
