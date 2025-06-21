import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { VariableType } from 'src/common/enums/variable-type.enum';
import { CreateQuoteVariableValueDto } from '../dto/create-quote-variable-value.dto';
import { QuoteTemplateVariableDto } from '../../quote-template/dto/quote-template-variable.dto';

@Injectable()
export class ValidateQuoteOnCreatePipe<
  T extends {
    templateId?: string;
    variableValues?: CreateQuoteVariableValueDto[];
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
  ): Promise<QuoteTemplateVariableDto[]> {
    const template = await this.prisma.quoteTemplate.findUnique({
      where: { id: templateId },
      include: { variables: true },
    });

    if (!template) {
      throw new BadRequestException(
        'Le modèle de devis spécifié est introuvable.',
      );
    }

    const systemVariables = await this.prisma.quoteTemplateVariable.findMany({
      where: { templateId: 'defaultTemplate' },
    });

    return [...template.variables, ...systemVariables];
  }

  private validateVariables(
    templateVariables: QuoteTemplateVariableDto[],
    submittedVariables: CreateQuoteVariableValueDto[],
  ) {
    const valueMap = new Map(
      submittedVariables.map((v) => [v.variableName, v.value]),
    );

    for (const variable of templateVariables) {
      const { variableName, required, type } = variable;
      const rawValue = valueMap.get(variableName);

      if (required && variableName !== 'quote_number' && this.isEmpty(rawValue))        
      {
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
