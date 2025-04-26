import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { InvoiceTemplateModule } from '../invoice-template/invoice-template.module';

@Module({
  imports: [PrismaModule, InvoiceTemplateModule],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
