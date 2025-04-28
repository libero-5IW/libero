import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { INVOICE_VARIABLES_SYSTEM } from 'src/common/constants/system-variables/invoice.variables';
import { InvoiceTemplateService } from '../../invoice-template/invoice-template.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';

@Injectable()
export class ValidateInvoiceVariablesPipe implements PipeTransform<CreateInvoiceDto> {
  constructor(private readonly invoiceTemplateService: InvoiceTemplateService) {}

  async transform(value: CreateInvoiceDto) {
    const { variables = {}, templateId } = value;

    await this.ensureTemplateVariables(templateId, variables);
    this.ensureSystemVariables(variables);
    this.validateBusinessRules(variables);

    return value;
  }

  private async ensureTemplateVariables(templateId: string, variables: Record<string, string>) {
    const template = await this.invoiceTemplateService.findOne(templateId);
    if (!template) {
      throw new BadRequestException('Template de facture introuvable');
    }

    const requiredTemplateVars = template.variables.map(v => v.variableName);
    const missingVars = requiredTemplateVars.filter(v => !(v in variables));

    if (missingVars.length > 0) {
      throw new BadRequestException(`Variables manquantes : ${missingVars.join(', ')}`);
    }
  }

  private ensureSystemVariables(variables: Record<string, string>) {
    const requiredSystemVars = INVOICE_VARIABLES_SYSTEM.filter(v => v.required);
    const missingVars = requiredSystemVars
      .filter(v => !(v.variableName in variables))
      .map(v => v.variableName);

    if (missingVars.length > 0) {
      throw new BadRequestException(`Variables système manquantes : ${missingVars.join(', ')}`);
    }
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
