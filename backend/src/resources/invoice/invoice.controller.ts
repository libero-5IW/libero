import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ValidateInvoiceOnCreatePipe } from './pipes/create-validate-invoice-variables.pipe';
import { ValidateInvoiceOnUpdatePipe } from './pipes/update-validate-invoice.pipe';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { InvoiceStatus } from '@prisma/client';

@ApiBearerAuth()
@ApiTags('Invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ValidateInvoiceOnCreatePipe(new PrismaService()))
    createInvoiceDto: CreateInvoiceDto,
  ) {
    return this.invoiceService.create(user.userId, createInvoiceDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.invoiceService.findAll(user.userId);
  }

  @Get('next-number')
  getNextInvoiceNumber(@CurrentUser() user: JwtPayload) {
    return this.invoiceService.getNextInvoiceNumber(user.userId);
  }

  @Get('search')
  searchInvoices(
    @Query('term') term: string,
    @Query('status') status: InvoiceStatus,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.invoiceService.search(user.userId, term, status);
  }
  

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.invoiceService.findOne(id, user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ValidateInvoiceOnUpdatePipe())
    updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoiceService.update(id, user.userId, updateInvoiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.invoiceService.remove(id, user.userId);
  }
  
}
