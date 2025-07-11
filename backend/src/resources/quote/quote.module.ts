import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { QuoteTemplateService } from '../quote-template/quote-template.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';
import { MailerService } from 'src/common/mailer/mailer.service';

@Module({
  controllers: [QuoteController],
  providers: [
    QuoteService,
    UserService,
    ClientService,
    QuoteTemplateService,
    S3Service,
    PdfGeneratorService,
    MailerService,
  ],
})
export class QuoteModule {}
