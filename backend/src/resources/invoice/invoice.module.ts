import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { InvoiceTemplateModule } from '../invoice-template/invoice-template.module';
import { ValidateInvoiceVariablesPipe } from './pipes/validate-invoice-variables.pipe';  

@Module({
  imports: [PrismaModule, InvoiceTemplateModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, ValidateInvoiceVariablesPipe],  
})
export class InvoiceModule {}
