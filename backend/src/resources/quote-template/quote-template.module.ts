import { Module } from '@nestjs/common';
import { QuoteTemplateService } from './quote-template.service';
import { QuoteTemplateController } from './quote-template.controller';
import { UserService } from '../user/user.service';

@Module({
  controllers: [QuoteTemplateController],
  providers: [QuoteTemplateService, UserService],
  exports: [QuoteTemplateService],
})
export class QuoteTemplateModule {}
