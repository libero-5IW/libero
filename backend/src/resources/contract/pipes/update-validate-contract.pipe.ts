import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { UpdateContractVariableValueDto } from '../dto/update-contract-variable-value.dto';
import { VariableType } from 'src/common/enums/variable-type.enum';

@Injectable()
export class ValidateContractOnUpdatePipe<
  T extends {
    variableValues?: UpdateContractVariableValueDto[];
  },
> implements PipeTransform<T>
{
  async transform(value: T): Promise<T> {
    const { variableValues = [] } = value;

    for (const variable of variableValues) {
      const { value: rawValue, variableName, type, required } = variable;

      if (
        required &&
        variableName !== 'contract_number' &&
        (rawValue === undefined ||
          rawValue === null ||
          (rawValue === '' &&
            ![
              'freelancer_signature',
              'freelancer_fullname_signed',
              'freelancer_date_signed',
              'client_signature',
              'client_date_signed',
              'client_fullname_signed',
            ].includes(variableName)))
      ) {
        throw new BadRequestException(
          `La variable requise "${variableName}" est manquante ou vide.`,
        );
      }

      if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
        const isValid = this.validateValueType(rawValue, type, variableName);
        if (!isValid) {
          throw new BadRequestException(
            `La variable "${variableName}" n'a pas un type valide (${type}).`,
          );
        }
      }
    }

    return value;
  }

  private validateValueType(
    value: string,
    type: VariableType,
    variableName: string,
  ): boolean {
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
        throw new BadRequestException(
          `Le type "${type}" pour la variable "${variableName}" n'est pas reconnu.`,
        );
    }
  }
}
