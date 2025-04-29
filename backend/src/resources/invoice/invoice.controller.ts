import { Controller, Post, Body, Get, Param,Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ValidateInvoiceVariablesPipe } from './pipes/validate-invoice-variables.pipe';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async createInvoice(
    @Body(new ValidateInvoiceVariablesPipe()) createInvoiceDto: CreateInvoiceDto
  ) {
    return await this.invoiceService.createInvoiceFromTemplate(createInvoiceDto, createInvoiceDto.userId);
  }
  

  @Get('next-number')
  async getNextInvoiceNumber(@Query('userId') userId: string) {
    return await this.invoiceService.getNextInvoiceNumber(userId);
  } 

  @Get(':id')
  async getInvoiceById(@Param('id') id: string) {
    return await this.invoiceService.getInvoiceOrThrow(id);
  }  

  @Get()
  async getAllInvoices() {
    return await this.invoiceService.findAll();
  }
}
