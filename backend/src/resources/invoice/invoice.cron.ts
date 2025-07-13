import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { MailerService } from 'src/common/mailer/mailer.service';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoiceCronService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  @Cron('0 7 * * *')
  async handleReminderBeforeDueDate() {
    const targetDate = dayjs().add(5, 'day').startOf('day').toDate();

    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: 'sent',
        dueDate: targetDate,
        clientId: { not: null },
      },
      include: { client: true, user: true },
    });

    for (const invoice of invoices) {
      if (invoice.clientId) {
        const clientFullName = `${invoice.client.firstName} ${invoice.client.lastName}`;

        await this.mailerService.sendReminderBeforeDue(
          invoice.client.email,
          clientFullName,
          invoice.user,
          invoice.number,
          invoice.dueDate,
        );
      }
    }
  }

  @Cron('0 2 * * *')
  async handleLateInvoiceCheck() {
    const targetDate = dayjs().subtract(1, 'day').startOf('day').toDate();

    const invoices = await this.prisma.invoice.findMany({
      where: {
        status: 'sent',
        dueDate: targetDate,
        clientId: { not: null },
      },
      include: { client: true, user: true },
    });

    for (const invoice of invoices) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: InvoiceStatus.overdue },
      });

      if (invoice.clientId) {
        const clientFullName = `${invoice.client.firstName} ${invoice.client.lastName}`;

        await this.mailerService.sendLateInvoiceNotice(
          invoice.client.email,
          clientFullName,
          invoice.user,
          invoice.number,
          invoice.dueDate,
        );
      }
    }
  }
}
