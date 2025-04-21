import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { InvoiceTemplateVariableDto } from '../dto/invoice-template-variable.dto';
import { INVOICE_VARIABLES_SYSTEM } from 'src/common/constants/system-variables';

@Injectable()
export class ValidateTemplateVariablesPipe<
  T extends { variables?: InvoiceTemplateVariableDto[]; contentHtml?: string },
> implements PipeTransform<T>
{
  transform(value: T): T {
    const { variables = [], contentHtml = '' } = value;

    this.ensureUniqueAndNonSystemVariables(variables);
    this.ensureRequiredVariablesInHtml(variables, contentHtml);
    this.ensureRequiredVariablesInHtml(INVOICE_VARIABLES_SYSTEM, contentHtml);

    return value;
  }

  private ensureUniqueAndNonSystemVariables(
    variables: InvoiceTemplateVariableDto[],
  ) {
    const seen = new Set<string>();

    for (const variable of variables) {
      const variableName = variable.variableName;
      const isSystemInvoiceVariable = INVOICE_VARIABLES_SYSTEM.some(
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

  private ensureRequiredVariablesInHtml(
    variables: InvoiceTemplateVariableDto[],
    contentHtml: string,
  ) {
    const systemRequiredVariables = INVOICE_VARIABLES_SYSTEM.filter(
      (v) => v.required,
    ).map((v) => v.variableName);

    const requiredVariables = [
      ...variables.filter((v) => v.required).map((v) => v.variableName),
      ...systemRequiredVariables,
    ];

    const missingVariables = requiredVariables.filter(
      (name) => !new RegExp(`{{\\s*${name}\\s*}}`).test(contentHtml),
    );

    if (missingVariables.length) {
      throw new BadRequestException(
        `Le contenu HTML ne contient pas les variables requises suivantes : ${missingVariables.join(', ')}`,
      );
    }
  }
}
