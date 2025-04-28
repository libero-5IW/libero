import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { INVOICE_VARIABLES_SYSTEM } from 'src/common/constants/system-variables/invoice.variables';

@Injectable()
export class ValidateInvoiceVariablesPipe implements PipeTransform {
  transform(value: { variables: Record<string, string> }) {
    const providedVars = value.variables || {};
    const requiredVars = INVOICE_VARIABLES_SYSTEM.filter(v => v.required);

    const missingVars = requiredVars
      .filter(v => !(v.variableName in providedVars))
      .map(v => v.variableName);

    if (missingVars.length > 0) {
      throw new BadRequestException(
        `Variables manquantes : ${missingVars.join(', ')}`
      );
    }

    this.validateBusinessRules(providedVars);

    return value;
  }

  private validateBusinessRules(vars: Record<string, string>) {
    const issueDate = new Date(vars['issue_date']);
    const dueDate = new Date(vars['due_date']);

    if (isNaN(issueDate.getTime()) || isNaN(dueDate.getTime())) {
      throw new BadRequestException('Les dates fournies sont invalides.');
    }

    if (dueDate <= issueDate) {
      throw new BadRequestException('La date d’échéance doit être postérieure à la date d’émission.');
    }

    const siret = vars['freelancer_siret'];
    if (!/^\d{14}$/.test(siret)) {
      throw new BadRequestException('Le numéro SIRET doit contenir exactement 14 chiffres.');
    }

    const totalAmount = parseFloat(vars['total_amount']);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      throw new BadRequestException('Le montant total HT doit être un nombre positif.');
    }
  }
}
