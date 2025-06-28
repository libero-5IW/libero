import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { InvoiceTemplateService } from '../invoice-template/invoice-template.service';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, UserService, ClientService, InvoiceTemplateService],
})
export class InvoiceModule {}
