import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { SearchQuoteDto } from './dto/search-quote.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ValidateQuoteOnCreatePipe } from './pipes/create-validate-quote.pipe';
import { ValidateQuoteOnUpdatePipe } from './pipes/update-validate-quote.pipe';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { QuoteStatus } from '@prisma/client';
import { Response } from 'express';
import { format } from 'date-fns';

@ApiBearerAuth()
@ApiTags('Quotes')
@Controller('quotes')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ValidateQuoteOnCreatePipe(new PrismaService()))
    createQuoteDto: CreateQuoteDto,
  ) {
    return this.quoteService.create(user.userId, createQuoteDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.quoteService.findAll(user.userId);
  }

  @Get('next-number')
  async getNextQuoteNumber(@CurrentUser() user: JwtPayload) {
    return await this.quoteService.getNextQuoteNumber(user.userId);
  }

  @Get('search')
  searchQuotes(
    @Query() query: SearchQuoteDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const {
      term = '',
      status,
      startDate,
      endDate,
      page,
      pageSize,
    } = query;
  
    const parsedStart = startDate ? new Date(startDate) : undefined;
    const parsedEnd = endDate ? new Date(endDate) : undefined;
  
    const parsedPage = page ? parseInt(String(page), 10) : undefined;
    const parsedPageSize = pageSize ? parseInt(String(pageSize), 10) : undefined;

    return this.quoteService.search(
      user.userId,
      term,
      status,
      parsedStart,
      parsedEnd,
      parsedPage,
      parsedPageSize,
    );
  }

  @Get('export')
  exportQuotes(
    @Query() query: SearchQuoteDto,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ) {
    const { term = '', status, startDate, endDate } = query;
  
    const parsedStart = startDate ? new Date(startDate) : undefined;
    const parsedEnd = endDate ? new Date(endDate) : undefined;
  
    return this.quoteService.exportToCSV(
      user.userId,
      term,
      status,
      parsedStart,
      parsedEnd,
    ).then(({ content, filename }) => {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.end(content);
    });
  }  

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.quoteService.findOne(id, user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body(new ValidateQuoteOnUpdatePipe())
    updateQuoteDto: UpdateQuoteDto,
  ) {
    return this.quoteService.update(id, user.userId, updateQuoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.quoteService.remove(id, user.userId);
  }

  
}
