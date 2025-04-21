import { Module } from '@nestjs/common';
import { InvoiceTemplateService } from './invoice-template.service';
import { InvoiceTemplateController } from './invoice-template.controller';

@Module({
  controllers: [InvoiceTemplateController],
  providers: [InvoiceTemplateService],
})
export class InvoiceTemplateModule {}
