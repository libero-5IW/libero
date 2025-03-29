import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { QuoteTemplateVariableDto } from '../dto/quote-template-variable.dto';
import { QUOTE_VARIABLES_SYSTEM } from 'src/common/constants/system-variables';

@Injectable()
export class ValidateTemplateVariablesPipe<
  T extends { variables?: QuoteTemplateVariableDto[]; contentHtml?: string },
> implements PipeTransform<T>
{
  transform(value: T): T {
    const { variables = [], contentHtml = '' } = value;

    this.ensureUniqueAndNonSystemVariables(variables);
    this.ensureRequiredVariablesInHtml(variables, contentHtml);

    return value;
  }

  private ensureUniqueAndNonSystemVariables(
    variables: QuoteTemplateVariableDto[],
  ) {
    const seen = new Set<string>();

    for (const variable of variables) {
      const variableName = variable.variableName;
      const isSystemQuoteVariable = QUOTE_VARIABLES_SYSTEM.some(
        (v) => v.variableName === variableName,
      );

      if (seen.has(variableName) || isSystemQuoteVariable) {
        throw new BadRequestException(
          `La variable "${variableName}" est définie plusieurs fois ou réservée.`,
        );
      }

      seen.add(variableName);
    }
  }

  private ensureRequiredVariablesInHtml(
    variables: QuoteTemplateVariableDto[],
    html: string,
  ) {
    const required = variables
      .filter((v) => v.required)
      .map((v) => v.variableName);

    const missing = required.filter(
      (name) => !new RegExp(`{{\\s*${name}\\s*}}`).test(html),
    );

    if (missing.length) {
      throw new BadRequestException(
        `Le contenu HTML ne contient pas les variables requises suivantes : ${missing.join(', ')}`,
      );
    }
  }
}
