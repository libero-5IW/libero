import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QuoteTemplateService } from './quote-template.service';
import { CreateQuoteTemplateDto } from './dto/create-quote-template.dto';
import { UpdateQuoteTemplateDto } from './dto/update-quote-template.dto';
import { ValidateTemplateVariablesPipe } from './pipes/validate-template-variables.pipe';
import { DEFAULT_QUOTE_TEMPLATE } from 'src/common/constants/system-templates/defaultQuoteTemplate';

@Controller('quote-templates')
export class QuoteTemplateController {
  constructor(private readonly quoteTemplateService: QuoteTemplateService) {}

  @Post()
  create(
    @Body(new ValidateTemplateVariablesPipe())
    createQuoteTemplateDto: CreateQuoteTemplateDto,
  ) {
    return this.quoteTemplateService.create(createQuoteTemplateDto);
  }

  @Get()
  findAll() {
    return this.quoteTemplateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quoteTemplateService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidateTemplateVariablesPipe())
    updateQuoteTemplateDto: UpdateQuoteTemplateDto,
  ) {
    return this.quoteTemplateService.update(id, updateQuoteTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quoteTemplateService.remove(id);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string) {
    return this.quoteTemplateService.duplicate(id);
  }

  @Get('default-template')
  getDefaultTemplate() {
    return DEFAULT_QUOTE_TEMPLATE;
  }
}
