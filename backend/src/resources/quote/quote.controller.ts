import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  Patch,
} from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ValidateQuoteOnCreatePipe } from './pipes/create-validate-quote.pipe';
import { ValidateQuoteOnUpdatePipe } from './pipes/update-validate-quote.pipe';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { QuoteStatus } from '@prisma/client';

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
  getNextQuoteNumber(@CurrentUser() user: JwtPayload) {
    return this.quoteService.getNextQuoteNumber(user.userId);
  }

  @Get('search')
  searchQuotes(
    @Query('term') term: string,
    @Query('status') status: QuoteStatus,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.quoteService.search(user.userId, term, status);
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

  @Patch(':id/change-status')
  changeStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { newStatus: QuoteStatus },
  ) {
    console.log('new', body.newStatus);

    return this.quoteService.changeStatus(id, user.userId, body.newStatus);
  }

  @Patch(':id/send')
  sendQuoteToClient(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.quoteService.sendQuoteToClient(id, user.userId);
  }
}
