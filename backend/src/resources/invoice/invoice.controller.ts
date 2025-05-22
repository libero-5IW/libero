import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ValidateInvoiceOnCreatePipe } from './pipes/create-validate-invoice-variables.pipe';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/database/prisma/prisma.service';

@ApiBearerAuth()
@ApiTags('Invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async createInvoice(
    @Body(new ValidateInvoiceOnCreatePipe(new PrismaService()))
    createInvoiceDto: CreateInvoiceDto,
  ) {
    return await this.invoiceService.createInvoiceFromTemplate(
      createInvoiceDto,
      createInvoiceDto.userId,
    );
  }

  @Get('next-number')
  async getNextInvoiceNumber(@Query('userId') userId: string) {
    return await this.invoiceService.getNextInvoiceNumber(userId);
  }

  @Get(':id')
  async getInvoiceById(@Param('id') id: string) {
    return await this.invoiceService.getInvoiceOrThrow(id);
  }

  // @Put(':id')
  // update(
  //   @Param('id') id: string,
  //   @CurrentUser() user: JwtPayload,
  //   @Body(new ValidateInvoiceOnUpdatePipe())
  //   updateQuoteDto: UpdateInvoiceDto,
  // ) {
  //   return this.invoiceService.update(id, user.userId, updateQuoteDto);
  // }

  @Get()
  async getAllInvoices() {
    return await this.invoiceService.findAll();
  }
}
