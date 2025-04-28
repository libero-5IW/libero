import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ValidateInvoiceVariablesPipe } from './pipes/validate-invoice-variables.pipe';
import { ApiTags } from '@nestjs/swagger';
import { UsePipes } from '@nestjs/common';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @UsePipes(ValidateInvoiceVariablesPipe)
  async createInvoice(
    @Body() createInvoiceDto: CreateInvoiceDto
    ) {
      return await this.invoiceService.createInvoiceFromTemplate(createInvoiceDto, createInvoiceDto.userId);
  }

  @Get('next-number')
  async getNextInvoiceNumber() {
    return await this.invoiceService.getNextInvoiceNumber();
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
