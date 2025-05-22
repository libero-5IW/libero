import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { QuoteTemplateService } from '../quote-template/quote-template.service';

@Module({
  controllers: [QuoteController],
  providers: [QuoteService, UserService, ClientService, QuoteTemplateService],
})
export class QuoteModule {}
