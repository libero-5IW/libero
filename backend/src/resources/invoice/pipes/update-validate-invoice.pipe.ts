import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { UpdateInvoiceVariableValueDto } from '../dto/update-invoice-variable-value.dto';
import { VariableType } from 'src/common/enums/variable-type.enum';

@Injectable()
export class ValidateInvoiceOnUpdatePipe<
  T extends {
    variableValues?: UpdateInvoiceVariableValueDto[];
  },
> implements PipeTransform<T>
{
  async transform(value: T): Promise<T> {
    const { variableValues = [] } = value;

    for (const variable of variableValues) {
      const { value: rawValue, variableName, type, required } = variable;

      if (
        required &&
        (rawValue === undefined || rawValue === null || rawValue === '')
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
