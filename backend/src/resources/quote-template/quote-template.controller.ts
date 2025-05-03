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
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('quote-templates')
export class QuoteTemplateController {
  constructor(private readonly quoteTemplateService: QuoteTemplateService) {}

  @Get('default-template')
  getDefaultTemplate() {
    return DEFAULT_QUOTE_TEMPLATE;
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ValidateTemplateVariablesPipe())
    createQuoteTemplateDto: CreateQuoteTemplateDto,
  ) {
    return this.quoteTemplateService.create(
      user.userId,
      createQuoteTemplateDto,
    );
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.quoteTemplateService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.quoteTemplateService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body(new ValidateTemplateVariablesPipe())
    updateQuoteTemplateDto: UpdateQuoteTemplateDto,
  ) {
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
