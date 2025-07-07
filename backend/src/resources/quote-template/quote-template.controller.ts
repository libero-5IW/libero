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
import { QuoteTemplateService } from './quote-template.service';
import { CreateQuoteTemplateDto } from './dto/create-quote-template.dto';
import { UpdateQuoteTemplateDto } from './dto/update-quote-template.dto';
import { ValidateTemplateVariablesPipe } from './pipes/validate-template-variables.pipe';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from 'src/database/prisma/prisma.service';

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
    @Query('term') term: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const parsedStart = startDate ? new Date(startDate) : undefined;
    const parsedEnd = endDate ? new Date(endDate) : undefined;
  
    return this.quoteTemplateService.search(user.userId, term, parsedStart, parsedEnd);
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
