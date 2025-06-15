import { Module } from '@nestjs/common';
import { InvoiceTemplateService } from './invoice-template.service';
import { InvoiceTemplateController } from './invoice-template.controller';
import { UserService } from '../user/user.service';

@Module({
  controllers: [InvoiceTemplateController],
  providers: [InvoiceTemplateService, UserService],
  exports: [InvoiceTemplateService],
})
export class InvoiceTemplateModule {}
