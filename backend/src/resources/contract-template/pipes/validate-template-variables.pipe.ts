import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ContractTemplateVariableDto } from '../dto/contract-template-variable.dto';
import { VariableType } from 'src/common/enums/variable-type.enum';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ContractTemplateVariableEntity } from '../entities/contract-template-variable.entity';

@Injectable()
export class ValidateTemplateVariablesPipe<
  T extends {
    id?: string;
    name?: string;
    variables?: ContractTemplateVariableDto[];
    contentHtml?: string;
  },
> implements PipeTransform<T>
{
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: T): Promise<T> {
    const { id, name, variables = [], contentHtml } = value;
    const existing = await this.prisma.contractTemplate.findFirst({
      where: {
        name: name?.trim(),
        NOT: id ? { id } : undefined,
      },
    });

    if (existing) {
      if (name === 'Modèle de base - Contrat') {
        throw new BadRequestException(
          `Le nom de modèle "${name}" est réservé. Veuillez choisir un autre nom.`,
        );
      } else {
        throw new BadRequestException(
          `Un modèle avec le nom "${name}" existe déjà. Veuillez choisir un autre nom.`,
        );
      }
    }

    const systemVariables = await this.prisma.contractTemplateVariable.findMany(
      {
        where: { templateId: 'defaultTemplate' },
      },
    );

    this.ensureUniqueAndNonSystemVariables(variables, systemVariables);
    this.ensureValidVariableTypes(variables);
    this.ensureRequiredVariablesInHtml(variables, contentHtml, systemVariables);

    return value;
  }

  private ensureUniqueAndNonSystemVariables(
    variables: ContractTemplateVariableDto[],
    systemVariables: ContractTemplateVariableEntity[],
  ) {
    const seen = new Set<string>();

    for (const variable of variables) {
      const variableName = variable.variableName;
      const isSystemVariable = systemVariables.some(
        (v) => v.variableName === variableName,
      );

      if (seen.has(variableName) || isSystemVariable) {
        throw new BadRequestException(
          `La variable "${variableName}" est définie plusieurs fois.`,
        );
      }

      seen.add(variableName);
    }
  }

  private ensureValidVariableTypes(variables: ContractTemplateVariableDto[]) {
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
    variables: ContractTemplateVariableDto[],
    contentHtml: string,
    systemVariables: ContractTemplateVariableEntity[],
  ) {
    const allVariables = [...variables, ...systemVariables];

    const requiredVariables = allVariables
      .filter((v) => v.required)
      .map((v) => v.variableName);

    const missingVariables = requiredVariables.filter(
      (name) => !new RegExp(`{{\\s*${name}\\s*}}`).test(contentHtml),
    );

    if (missingVariables.length) {
      const missingDescriptions = missingVariables.map((name) => {
        const match = allVariables.find((v) => v.variableName === name);
        const label = match?.label || 'Inconnu';
        return `${label} (${name})`;
      });
      throw new BadRequestException(
        `Le contenu HTML ne contient pas les variables requises suivantes : ${missingDescriptions.join(', ')}`,
      );
    }
  }
}
