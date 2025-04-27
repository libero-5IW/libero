import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './resources/user/user.module';
// import { QuoteModule } from './resources/quote/quote.module';
import { QuoteTemplateModule } from './resources/quote-template/quote-template.module';
import { PrismaModule } from './database/prisma/prisma.module';
import { InvoiceTemplateModule } from './resources/invoice-template/invoice-template.module';
import { ContractModule } from './resources/contract/contract.module';
import { ContractTemplateModule } from './resources/contract-template/contract-template.module';
import { InvoiceModule } from './resources/invoice/invoice.module';
import { ClientModule } from './resources/client/client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    // QuoteModule,
    QuoteTemplateModule,
    InvoiceTemplateModule,
    ContractModule,
    ContractTemplateModule,
    InvoiceModule,
    ClientModule,
  ],
})
export class AppModule {}
