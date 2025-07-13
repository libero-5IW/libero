import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { InvoiceTemplateService } from '../invoice-template/invoice-template.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';
import { MailerService } from 'src/common/mailer/mailer.service';
import { ScheduleModule } from '@nestjs/schedule';
import { InvoiceCronService } from './invoice.cron';
@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
    UserService,
    ClientService,
    InvoiceTemplateService,
    S3Service,
    PdfGeneratorService,
    MailerService,
    InvoiceCronService,
  ],
})
export class InvoiceModule {}
