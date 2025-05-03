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
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('invoice-templates')
export class InvoiceTemplateController {
  constructor(
    private readonly invoiceTemplateService: InvoiceTemplateService,
  ) {}

  @Get('default-template')
  getDefaultTemplate() {
    return DEFAULT_INVOICE_TEMPLATE;
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ValidateTemplateVariablesPipe())
    createInvoiceTemplateDto: CreateInvoiceTemplateDto,
  ) {
    return this.invoiceTemplateService.create(
      user.userId,
      createInvoiceTemplateDto,
    );
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.invoiceTemplateService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.invoiceTemplateService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body(new ValidateTemplateVariablesPipe())
    updateInvoiceTemplateDto: UpdateInvoiceTemplateDto,
  ) {
    return this.invoiceTemplateService.update(
      id,
      user.userId,
      updateInvoiceTemplateDto,
    );
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.invoiceTemplateService.remove(id, user.userId);
  }

  @Post(':id/duplicate')
  duplicate(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.invoiceTemplateService.duplicate(id, user.userId);
  }
}
