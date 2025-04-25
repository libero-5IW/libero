import { Module } from '@nestjs/common';
import { InvoiceTemplateService } from './invoice-template.service';
import { InvoiceTemplateController } from './invoice-template.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { UserModule } from '../user/user.module'; 

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [InvoiceTemplateController],
  providers: [InvoiceTemplateService],
})
export class InvoiceTemplateModule {}
