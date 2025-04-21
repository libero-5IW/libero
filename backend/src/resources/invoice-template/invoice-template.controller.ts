import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InvoiceTemplateService } from './invoice-template.service';
import { CreateInvoiceTemplateDto } from './dto/create-invoice-template.dto';
import { UpdateInvoiceTemplateDto } from './dto/update-invoice-template.dto';
import { ValidateTemplateVariablesPipe } from './pipes/validate-template-variables.pipe';
import { DEFAULT_INVOICE_TEMPLATE } from 'src/common/constants/system-templates/defaultInvoiceTemplate';

@Controller('invoice-templates')
export class InvoiceTemplateController {
  constructor(private readonly invoiceTemplateService: InvoiceTemplateService) {}

  @Get('default-template')
  getDefaultTemplate() {
    return DEFAULT_INVOICE_TEMPLATE;
  }

  @Post()
  create(
    @Body(new ValidateTemplateVariablesPipe())
    createInvoiceTemplateDto: CreateInvoiceTemplateDto,
  ) {
    return this.invoiceTemplateService.create(createInvoiceTemplateDto);
  }

  @Get()
  findAll() {
    return this.invoiceTemplateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceTemplateService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidateTemplateVariablesPipe())
    updateInvoiceTemplateDto: UpdateInvoiceTemplateDto,
  ) {
    return this.invoiceTemplateService.update(id, updateInvoiceTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceTemplateService.remove(id);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.invoiceTemplateService.duplicate(id);
  }
}
