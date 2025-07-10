import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res
} from '@nestjs/common';
import { QuoteTemplateService } from './quote-template.service';
import { CreateQuoteTemplateDto } from './dto/create-quote-template.dto';
import { UpdateQuoteTemplateDto } from './dto/update-quote-template.dto';
import { ValidateTemplateVariablesPipe } from './pipes/validate-template-variables.pipe';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { SearchQuoteTemplateDto } from './dto/search-quote-template.dto';
import { Response } from 'express';

@ApiBearerAuth()
@Controller('quote-templates')
export class QuoteTemplateController {
  constructor(private readonly quoteTemplateService: QuoteTemplateService) {}

  @Get('default-template')
  getDefaultTemplate() {
    return this.quoteTemplateService.getDefaultTemplate();
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ValidateTemplateVariablesPipe(new PrismaService()))
    createQuoteTemplateDto: CreateQuoteTemplateDto,
  ) {
    return this.quoteTemplateService.create(
      user.userId,
      createQuoteTemplateDto,
    );
  }

  @Get('search')
  search(
    @Query() query: SearchQuoteTemplateDto,
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
  
    return this.quoteTemplateService.search(
      user.userId,
      term,
      parsedStart,
      parsedEnd,
      parsedPage,
      parsedPageSize,
    );
  }

  @Get('export')
  exportTemplates(
    @Query() query: SearchQuoteTemplateDto,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const { term = '', startDate, endDate } = query;
  
    const parsedStart = startDate ? new Date(startDate) : undefined;
    const parsedEnd = endDate ? new Date(endDate) : undefined;
  
    return this.quoteTemplateService.exportToCSV(
      user.userId,
      term,
      parsedStart,
      parsedEnd,
    ).then(({ content, filename }) => {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.end(content);
    });
  }  

  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('includeDefault') includeDefault: string,
  ) {
    const include = includeDefault !== 'false';
    return this.quoteTemplateService.findAll(user.userId, include);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.quoteTemplateService.findOne(id, user.userId);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body()
    updateQuoteTemplateDto: UpdateQuoteTemplateDto,
  ) {
    const pipe = new ValidateTemplateVariablesPipe(new PrismaService());
    await pipe.transform({
      ...updateQuoteTemplateDto,
      id,
    });

    return this.quoteTemplateService.update(
      id,
      user.userId,
      updateQuoteTemplateDto,
    );
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.quoteTemplateService.remove(id, user.userId);
  }

  @Post(':id/duplicate')
  duplicate(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.quoteTemplateService.duplicate(id, user.userId);
  }
  
}
