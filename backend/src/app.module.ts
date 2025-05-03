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
import { AuthModule } from './resources/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './resources/auth/guards/jwt-auth.guard';

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
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
