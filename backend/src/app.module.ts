import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './resources/user/user.module';
// import { QuoteModule } from './resources/quote/quote.module';
import { QuoteTemplateModule } from './resources/quote-template/quote-template.module';
import { PrismaModule } from './database/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UserModule,
    // QuoteModule,
    QuoteTemplateModule,
  ],
})
export class AppModule {}
