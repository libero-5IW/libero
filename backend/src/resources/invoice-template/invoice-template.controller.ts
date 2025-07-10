import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { InvoiceTemplateService } from './invoice-template.service';
import { CreateInvoiceTemplateDto } from './dto/create-invoice-template.dto';
import { UpdateInvoiceTemplateDto } from './dto/update-invoice-template.dto';
import { ValidateTemplateVariablesPipe } from './pipes/validate-template-variables.pipe';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { SearchInvoiceTemplateDto } from './dto/search-invoice-template.dto';

@ApiBearerAuth()
@Controller('invoice-templates')
export class InvoiceTemplateController {
  constructor(private readonly invoiceTemplateService: InvoiceTemplateService) {}

  @Get('default-template')
  getDefaultTemplate() {
    return this.invoiceTemplateService.getDefaultTemplate();
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ValidateTemplateVariablesPipe(new PrismaService()))
    createInvoiceTemplateDto: CreateInvoiceTemplateDto,
  ) {
    return this.invoiceTemplateService.create(
      user.userId,
      createInvoiceTemplateDto,
    );
  }

  @Get('search')
  search(
    @Query() query: SearchInvoiceTemplateDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const {
      term = '',
      startDate,
      endDate,
      page,
      pageSize,
    } = query;
  
    const parsedStart = startDate ? new Date(startDate) : undefined;
    const parsedEnd = endDate ? new Date(endDate) : undefined;
  
    const parsedPage = page ? parseInt(String(page), 10) : undefined;
    const parsedPageSize = pageSize ? parseInt(String(pageSize), 10) : undefined;
  
    return this.invoiceTemplateService.search(
      user.userId,
      term,
      parsedStart,
      parsedEnd,
      parsedPage,
      parsedPageSize,
    );
  }

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('includeDefault') includeDefault: string,
  ) {
    const include = includeDefault !== 'false';
    return this.invoiceTemplateService.findAll(user.userId, include);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.invoiceTemplateService.findOne(id, user.userId);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body()
    updateInvoiceTemplateDto: UpdateInvoiceTemplateDto,
  ) {
    const pipe = new ValidateTemplateVariablesPipe(new PrismaService());
    await pipe.transform({
      ...updateInvoiceTemplateDto,
      id,
    });

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
