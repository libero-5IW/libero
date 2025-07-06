import { Module } from '@nestjs/common';
import { InvoiceTemplateService } from './invoice-template.service';
import { InvoiceTemplateController } from './invoice-template.controller';
import { UserService } from '../user/user.service';
import { S3Service } from 'src/common/s3/s3.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';

@Module({
  controllers: [InvoiceTemplateController],
  providers: [
    InvoiceTemplateService,
    UserService,
    S3Service,
    PdfGeneratorService,
  ],
  exports: [InvoiceTemplateService],
})
export class InvoiceTemplateModule {}
