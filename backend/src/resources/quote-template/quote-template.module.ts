import { Module } from '@nestjs/common';
import { QuoteTemplateService } from './quote-template.service';
import { QuoteTemplateController } from './quote-template.controller';
import { UserService } from '../user/user.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';

@Module({
  controllers: [QuoteTemplateController],
  providers: [
    QuoteTemplateService,
    UserService,
    S3Service,
    PdfGeneratorService,
  ],
  exports: [QuoteTemplateService],
})
export class QuoteTemplateModule {}
