import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { INVOICE_VARIABLES_SYSTEM } from 'src/common/constants/system-variables/invoice.variables';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';

@Injectable()
export class ValidateInvoiceVariablesPipe
  implements PipeTransform<CreateInvoiceDto>
{
  transform(value: CreateInvoiceDto): CreateInvoiceDto {
    const { variables = {} } = value;

    this.ensureSystemVariablesExist(variables);
    this.validateBusinessRules(variables);

    return value;
  }

  private ensureSystemVariablesExist(variables: Record<string, string>) {
    const requiredSystemVariables = INVOICE_VARIABLES_SYSTEM.filter(v => v.required);
    const missingSystemVariables = requiredSystemVariables
      .filter(v => !(v.variableName in variables))
      .map(v => v.variableName);

    if (missingSystemVariables.length > 0) {
      throw new BadRequestException(
        `Variables système manquantes : ${missingSystemVariables.join(', ')}`
      );
    }
  }

  private validateBusinessRules(variables: Record<string, string>) {
    const issueDate = new Date(variables['issue_date']);
    const dueDate = new Date(variables['due_date']);

    if (isNaN(issueDate.getTime()) || isNaN(dueDate.getTime())) {
      throw new BadRequestException('Les dates fournies sont invalides.');
    }

    if (dueDate <= issueDate) {
      throw new BadRequestException('La date d’échéance doit être postérieure à la date d’émission.');
    }

    const siret = variables['freelancer_siret'];
    if (!/^\d{14}$/.test(siret)) {
      throw new BadRequestException('Le numéro SIRET doit contenir exactement 14 chiffres.');
    }

    const totalAmount = parseFloat(variables['total_amount']);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      throw new BadRequestException('Le montant total HT doit être un nombre positif.');
    }
  }
}
