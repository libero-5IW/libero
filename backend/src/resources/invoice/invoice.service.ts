import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { plainToInstance } from 'class-transformer';
import { InvoiceEntity } from './entities/invoice.entity';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { InvoiceTemplateService } from '../invoice-template/invoice-template.service';
import { InvoiceStatus, VariableType } from '@prisma/client';
import { generateNextNumber } from 'src/common/utils/generate-number.util';
import { CreateInvoiceVariableValueDto } from './dto/create-invoice-variable-value.dto';
import { InvoiceTemplateVariableEntity } from '../invoice-template/entities/invoice-template-variable.entity';
import { S3Service } from 'src/common/s3/s3.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { buildSearchQuery } from 'src/common/utils/buildSearchQuery.util';
import { MailerService } from 'src/common/mailer/mailer.service';
import { ClientEntity } from '../client/entities/client.entity';

@Injectable()
export class InvoiceService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly invoiceTemplateService: InvoiceTemplateService,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly s3Service: S3Service,
    private readonly mailerService: MailerService,
  ) {}

  async create(userId: string, dto: CreateInvoiceDto): Promise<InvoiceEntity> {
    const {
      clientId,
      templateId,
      generatedHtml,
      dueDate,
      variableValues,
      quoteId,
      contractId,
    } = dto;

    const user = await this.userService.getUserOrThrow(userId);

    if (clientId) {
      await this.clientService.getClientOrThrow(clientId, userId);
    }

    const template = await this.invoiceTemplateService.findOne(
      templateId,
      userId,
    );
    const nextNumber = await this.getNextInvoiceNumber(userId);

    const { pdfBuffer, previewBuffer } =
      await this.pdfGeneratorService.generatePdfAndPreview(generatedHtml);

    const { pdfKey, previewKey } = await this.s3Service.uploadDocumentAssets(
      pdfBuffer,
      previewBuffer,
      user.email,
      'invoices',
    );

    const invoice = await this.prisma.invoice.create({
      data: {
        number: nextNumber,
        template: { connect: { id: templateId } },
        user: { connect: { id: userId } },
        ...(clientId ? { client: { connect: { id: clientId } } } : {}),
        ...(quoteId ? { quote: { connect: { id: quoteId } } } : {}),
        ...(contractId ? { contract: { connect: { id: contractId } } } : {}),
        status: InvoiceStatus.draft,
        generatedHtml,
        dueDate: new Date(dueDate),
        issuedAt: null,
        pdfKey,
        previewKey,
        variableValues: {
          create: this.mapVariableWithTemplateData(
            variableValues,
            template.variables,
          ),
        },
      },
      include: { variableValues: true },
    });

    return plainToInstance(InvoiceEntity, invoice, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async findAll(userId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { userId },
      include: { variableValues: true },
    });

    const invoicesWithUrls = await Promise.all(
      invoices.map(async (invoice) => {
        const previewUrl = invoice.previewKey
          ? await this.s3Service.generateSignedUrl(invoice.previewKey)
          : null;

        const pdfUrl = invoice.pdfKey
          ? await this.s3Service.generateSignedUrl(invoice.pdfKey)
          : null;

        return {
          ...invoice,
          previewUrl,
          pdfUrl,
        };
      }),
    );

    return plainToInstance(InvoiceEntity, invoicesWithUrls, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async findOne(id: string, userId: string) {
    const invoice = await this.getInvoiceOrThrow(id, userId);
    const previewUrl = invoice.previewKey
      ? await this.s3Service.generateSignedUrl(invoice.previewKey)
      : null;

    const pdfUrl = invoice.pdfKey
      ? await this.s3Service.generateSignedUrl(invoice.pdfKey)
      : null;

    return plainToInstance(InvoiceEntity, {
      ...invoice,
      previewUrl,
      pdfUrl,
    });
  }

  async update(id: string, userId: string, dto: UpdateInvoiceDto) {
    const { variableValues, ...otherData } = dto;
    const existing = await this.getInvoiceOrThrow(id, userId);

    if (existing.status !== InvoiceStatus.draft) {
      throw new BadRequestException(
        'Seules les factures en brouillon peuvent être modifiées.',
      );
    }

    const template = await this.invoiceTemplateService.findOne(
      existing.templateId,
      userId,
    );

    const preparedVariables = this.mapVariableWithTemplateData(
      variableValues ?? [],
      template.variables,
    );

    const user = await this.userService.getUserOrThrow(userId);

    if (existing.pdfKey) {
      await this.s3Service.deleteFile(existing.pdfKey);
    }
    if (existing.previewKey) {
      await this.s3Service.deleteFile(existing.previewKey);
    }

    const { pdfBuffer, previewBuffer } =
      await this.pdfGeneratorService.generatePdfAndPreview(
        otherData.generatedHtml,
      );

    const { pdfKey, previewKey } = await this.s3Service.uploadDocumentAssets(
      pdfBuffer,
      previewBuffer,
      user.email,
      'invoices',
    );

    const updatedInvoice = await this.prisma.$transaction(async (tx) => {
      await tx.invoiceVariableValue.deleteMany({
        where: { invoiceId: id },
      });

      if (preparedVariables.length > 0) {
        await tx.invoiceVariableValue.createMany({
          data: preparedVariables.map((v) => ({
            invoiceId: id,
            variableName: v.variableName,
            value: v.value,
            label: v.label,
            type: v.type,
            required: v.required,
          })),
        });
      }

      return tx.invoice.update({
        where: { id },
        data: { ...otherData, pdfKey, previewKey },
        include: { variableValues: true },
      });
    });

    return plainToInstance(InvoiceEntity, updatedInvoice, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async remove(id: string, userId: string) {
    const invoice = await this.getInvoiceOrThrow(id, userId);

    if (invoice.pdfKey) {
      await this.s3Service.deleteFile(invoice.pdfKey);
    }
    if (invoice.previewKey) {
      await this.s3Service.deleteFile(invoice.previewKey);
    }
    const deleted = await this.prisma.invoice.delete({ where: { id } });
    return plainToInstance(InvoiceEntity, deleted);
  }

  async getNextInvoiceNumber(userId: string) {
    return generateNextNumber('invoice', userId);
  }

  private async getInvoiceOrThrow(id: string, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, userId },
      include: { variableValues: true },
    });
    if (!invoice) {
      throw new NotFoundException('Facture non trouvée.');
    }
    return invoice;
  }

  private mapVariableWithTemplateData(
    submitted: CreateInvoiceVariableValueDto[],
    templateVars: InvoiceTemplateVariableEntity[],
  ) {
    const templateMap = new Map(templateVars.map((v) => [v.variableName, v]));

    return submitted.map((v) => {
      const templateVar = templateMap.get(v.variableName);
      if (!templateVar) {
        throw new Error(
          `Variable ${v.variableName} non définie dans le template`,
        );
      }

      return {
        variableName: v.variableName,
        value: v.value,
        label: templateVar.label,
        type: templateVar.type as VariableType,
        required: templateVar.required,
      };
    });
  }

  async search(userId: string, search: string, status?: InvoiceStatus) {
    const baseWhere = buildSearchQuery(search, userId, 'facture');

    const where = {
      ...baseWhere,
      ...(status ? { status } : {}),
    };

    const invoices = await this.prisma.invoice.findMany({
      where,
      include: {
        variableValues: true,
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const invoicesWithUrls = await Promise.all(
      invoices.map(async (invoice) => {
        const previewUrl = invoice.previewKey
          ? await this.s3Service.generateSignedUrl(invoice.previewKey)
          : null;

        const pdfUrl = invoice.pdfKey
          ? await this.s3Service.generateSignedUrl(invoice.pdfKey)
          : null;

        return {
          ...invoice,
          previewUrl,
          pdfUrl,
        };
      }),
    );

    return plainToInstance(InvoiceEntity, invoicesWithUrls, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  private generatePaidHtml(originalHtml: string, paidDate: Date): string {
    const formattedDate = paidDate.toLocaleDateString('fr-FR');
    const acquittedNotice = `
    <div style="margin-top:40px;padding:25px;border:2px dashed #2e7d32;background-color:#e8f5e9;color:#2e7d32;text-align:center;border-radius:6px;">
      <p style="margin:0;font-size:18px;font-weight:600;">
        ✅ Facture acquittée
      </p>
      <p style="margin:5px 0 0 0;font-size:14px;">
        Cette facture a été réglée en totalité le <strong>${formattedDate}</strong>.
      </p>
    </div>
  `;

    if (originalHtml.includes('</body>')) {
      return originalHtml.replace('</body>', `${acquittedNotice}</body>`);
    }

    return `${originalHtml}${acquittedNotice}`;
  }

  async changeStatus(
    id: string,
    userId: string,
    userEmail: string,
    newStatus: InvoiceStatus,
  ): Promise<InvoiceEntity> {
    const invoice = await this.getInvoiceOrThrow(id, userId);
    const currentStatus = invoice.status;

    if (newStatus === currentStatus) {
      return plainToInstance(InvoiceEntity, invoice, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      });
    }

    const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      [InvoiceStatus.draft]: [InvoiceStatus.sent],
      [InvoiceStatus.sent]: [
        InvoiceStatus.paid,
        InvoiceStatus.cancelled,
        InvoiceStatus.overdue,
      ],
      [InvoiceStatus.overdue]: [InvoiceStatus.paid, InvoiceStatus.cancelled],
      [InvoiceStatus.cancelled]: [],
      [InvoiceStatus.paid]: [],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Transition du statut "${currentStatus}" vers "${newStatus}" non autorisée.`,
      );
    }

    const updateData: any = { status: newStatus };

    if (newStatus === InvoiceStatus.sent) {
      updateData.issuedAt = new Date();
    }

    if (newStatus === InvoiceStatus.paid) {
      const paidHtml = this.generatePaidHtml(invoice.generatedHtml, new Date());

      const { pdfBuffer, previewBuffer } =
        await this.pdfGeneratorService.generatePdfAndPreview(paidHtml);

      if (invoice.pdfKey) await this.s3Service.deleteFile(invoice.pdfKey);
      if (invoice.previewKey)
        await this.s3Service.deleteFile(invoice.previewKey);

      const { pdfKey, previewKey } = await this.s3Service.uploadDocumentAssets(
        pdfBuffer,
        previewBuffer,
        userEmail,
        'invoices',
      );

      updateData.generatedHtml = paidHtml;
      updateData.pdfKey = pdfKey;
      updateData.previewKey = previewKey;
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: { variableValues: true },
    });

    return plainToInstance(InvoiceEntity, updatedInvoice, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async sendInvoiceToClient(id: string, userId: string) {
    const user = await this.userService.getUserOrThrow(userId);
    const invoice = await this.getInvoiceOrThrow(id, userId);

    if (
      invoice.status !== InvoiceStatus.draft &&
      invoice.status !== InvoiceStatus.sent
    ) {
      throw new BadRequestException(
        `Impossible d’envoyer la facture : statut "${invoice.status}".`,
      );
    }

    const client = await this.clientService.getClientOrThrow(
      invoice.clientId,
      userId,
    );

    const pdfBuffer = await this.s3Service.getFileBuffer(invoice.pdfKey);
    const clientName = `${client.firstName} ${client.lastName.toUpperCase()}`;

    await this.mailerService.sendInvoiceToPayEmail(
      client.email,
      clientName,
      user,
      invoice.number,
      pdfBuffer,
    );

    await this.changeStatus(id, userId, user.email, InvoiceStatus.sent);

    return plainToInstance(ClientEntity, client);
  }

  async sendPaidInvoiceToClient(id: string, userId: string) {
    const user = await this.userService.getUserOrThrow(userId);
    const invoice = await this.getInvoiceOrThrow(id, userId);

    if (
      invoice.status !== InvoiceStatus.paid &&
      invoice.status !== InvoiceStatus.sent
    ) {
      throw new BadRequestException(
        `Impossible d’envoyer la facture acquittée: statut "${invoice.status}".`,
      );
    }

    const client = await this.clientService.getClientOrThrow(
      invoice.clientId,
      userId,
    );

    const newInvoice = await this.changeStatus(
      id,
      userId,
      user.email,
      InvoiceStatus.paid,
    );

    const pdfBuffer = await this.s3Service.getFileBuffer(newInvoice.pdfKey);
    const clientName = `${client.firstName} ${client.lastName.toUpperCase()}`;

    await this.mailerService.sendInvoicePaidEmail(
      client.email,
      clientName,
      user,
      invoice.number,
      pdfBuffer,
    );

    return plainToInstance(ClientEntity, client);
  }
}
