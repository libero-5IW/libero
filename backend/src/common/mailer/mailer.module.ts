import { MailerModule as ExternalMailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    ExternalMailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: `"Libero" <${process.env.MAIL_FROM}>`,
      },
      template: {
        dir: join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
