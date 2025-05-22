import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { InvoiceTemplateModule } from '../invoice-template/invoice-template.module';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';

@Module({
  imports: [PrismaModule, InvoiceTemplateModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, UserService, ClientService],
})
export class InvoiceModule {}
