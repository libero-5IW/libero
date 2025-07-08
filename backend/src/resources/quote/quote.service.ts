import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { plainToInstance } from 'class-transformer';
import { QuoteEntity } from './entities/quote.entity';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { QuoteTemplateService } from '../quote-template/quote-template.service';
import { QuoteStatus, VariableType } from '@prisma/client';
import { generateNextNumber } from 'src/common/utils/generate-number.util';
import { CreateQuoteVariableValueDto } from './dto/create-quote-variable-value.dto';
import { QuoteTemplateVariableEntity } from '../quote-template/entities/quote-template-variable.entity';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';
import { buildSearchQuery } from 'src/common/utils/buildSearchQuery.util';
import { MailerService } from 'src/common/mailer/mailer.service';
import { ClientEntity } from '../client/entities/client.entity';

@Injectable()
export class QuoteService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly quoteTemplateService: QuoteTemplateService,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly s3Service: S3Service,
    private readonly mailerService: MailerService,
  ) {}

  async create(
    userId: string,
    createQuoteDto: CreateQuoteDto,
  ): Promise<QuoteEntity> {
    const { clientId, templateId, generatedHtml, validUntil, variableValues } =
      createQuoteDto;

    const user = await this.userService.getUserOrThrow(userId);

    if (clientId) {
      await this.clientService.getClientOrThrow(clientId, userId);
    }

    const template = await this.quoteTemplateService.findOne(
      templateId,
      userId,
    );

    const nextNumber = await this.getNextQuoteNumber(userId);

    const { pdfBuffer, previewBuffer } =
      await this.pdfGeneratorService.generatePdfAndPreview(generatedHtml);

    const { pdfKey, previewKey } = await this.s3Service.uploadDocumentAssets(
      pdfBuffer,
      previewBuffer,
      user.email,
      'quotes',
    );

    const quote = await this.prisma.quote.create({
      data: {
        number: nextNumber,
        template: { connect: { id: templateId } },
        user: { connect: { id: userId } },
        ...(clientId ? { client: { connect: { id: clientId } } } : {}),
        status: QuoteStatus.draft,
        generatedHtml,
        validUntil: new Date(validUntil),
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
      include: {
        variableValues: true,
      },
    });

    return plainToInstance(QuoteEntity, quote, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async findAll(userId: string) {
    const quotes = await this.prisma.quote.findMany({
      where: { userId },
      include: { variableValues: true },
    });

    const quotesWithUrls = await Promise.all(
      quotes.map(async (quote) => {
        const previewUrl = quote.previewKey
          ? await this.s3Service.generateSignedUrl(quote.previewKey)
          : null;

        const pdfUrl = quote.pdfKey
          ? await this.s3Service.generateSignedUrl(quote.pdfKey)
          : null;

        return {
          ...quote,
          previewUrl,
          pdfUrl,
        };
      }),
    );

    return plainToInstance(QuoteEntity, quotesWithUrls, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async findOne(id: string, userId: string) {
    const quote = await this.getQuoteOrThrow(id, userId);
    const previewUrl = quote.previewKey
      ? await this.s3Service.generateSignedUrl(quote.previewKey)
      : null;

    const pdfUrl = quote.pdfKey
      ? await this.s3Service.generateSignedUrl(quote.pdfKey)
      : null;

    return plainToInstance(QuoteEntity, {
      ...quote,
      previewUrl,
      pdfUrl,
    });
  }

  async update(id: string, userId: string, data: UpdateQuoteDto) {
    const { variableValues, ...otherData } = data;
    const existingQuote = await this.getQuoteOrThrow(id, userId);

    if (existingQuote.status !== QuoteStatus.draft) {
      throw new BadRequestException(
        'Seuls les devis en brouillon peuvent être modifiés.',
      );
    }

    await this.quoteTemplateService.findOne(otherData.templateId, userId);

    const user = await this.userService.getUserOrThrow(userId);

    if (existingQuote.pdfKey) {
      await this.s3Service.deleteFile(existingQuote.pdfKey);
    }
    if (existingQuote.previewKey) {
      await this.s3Service.deleteFile(existingQuote.previewKey);
    }

    const { pdfBuffer, previewBuffer } =
      await this.pdfGeneratorService.generatePdfAndPreview(
        otherData.generatedHtml,
      );

    const { pdfKey, previewKey } = await this.s3Service.uploadDocumentAssets(
      pdfBuffer,
      previewBuffer,
      user.email,
      'quotes',
    );

    for (const variable of variableValues ?? []) {
      await this.prisma.quoteVariableValue.update({
        where: {
          quoteId_variableName: {
            quoteId: id,
            variableName: variable.variableName,
          },
        },
        data: {
          value: variable.value,
        },
      });
    }

    const updatedQuote = await this.prisma.quote.update({
      where: { id },
      data: {
        ...otherData,
        pdfKey,
        previewKey,
      },
      include: {
        variableValues: true,
      },
    });

    return plainToInstance(QuoteEntity, updatedQuote, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async remove(id: string, userId: string) {
    const quote = await this.getQuoteOrThrow(id, userId);

    if (quote.pdfKey) {
      await this.s3Service.deleteFile(quote.pdfKey);
    }
    if (quote.previewKey) {
      await this.s3Service.deleteFile(quote.previewKey);
    }
    const deletedQuote = this.prisma.quote.delete({ where: { id } });

    return plainToInstance(QuoteEntity, deletedQuote);
  }

  async getNextQuoteNumber(userId: string) {
    return generateNextNumber('quote', userId);
  }

  private async getQuoteOrThrow(id: string, userId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, userId },
      include: { variableValues: true },
    });
    if (!quote) {
      throw new NotFoundException('Devis non trouvé.');
    }
    return quote;
  }

  private mapVariableWithTemplateData(
    submittedVariables: CreateQuoteVariableValueDto[],
    templateVariables: QuoteTemplateVariableEntity[],
  ) {
    const templateMap = new Map(
      templateVariables.map((v) => [v.variableName, v]),
    );

    return submittedVariables.map((v) => {
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
  //a supp?
  async getPreviewSignedUrl(id: string, userId: string): Promise<string> {
    const quote = await this.prisma.quote.findUnique({ where: { id } });

    if (!quote || quote.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }

    return this.s3Service.generateSignedUrl(quote.previewKey);
  }

  async search(userId: string, search: string, status?: QuoteStatus) {
    const baseWhere = buildSearchQuery(search, userId, 'devis');

    const where = {
      ...baseWhere,
      ...(status ? { status } : {}),
    };

    const quotes = await this.prisma.quote.findMany({
      where,
      include: {
        variableValues: true,
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const quotesWithUrls = await Promise.all(
      quotes.map(async (quote) => {
        const previewUrl = quote.previewKey
          ? await this.s3Service.generateSignedUrl(quote.previewKey)
          : null;

        const pdfUrl = quote.pdfKey
          ? await this.s3Service.generateSignedUrl(quote.pdfKey)
          : null;

        return {
          ...quote,
          previewUrl,
          pdfUrl,
        };
      }),
    );

    return plainToInstance(QuoteEntity, quotesWithUrls, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async changeStatus(
    id: string,
    userId: string,
    newStatus: QuoteStatus,
  ): Promise<QuoteEntity> {
    const quote = await this.getQuoteOrThrow(id, userId);
    const currentStatus = quote.status;

    if (newStatus === currentStatus) {
      return plainToInstance(QuoteEntity, quote, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      });
    }

    const allowedManualTransitions: Record<QuoteStatus, QuoteStatus[]> = {
      [QuoteStatus.sent]: [QuoteStatus.accepted, QuoteStatus.refused],
      [QuoteStatus.accepted]: [QuoteStatus.refused, QuoteStatus.sent],
      [QuoteStatus.refused]: [QuoteStatus.accepted, QuoteStatus.sent],
      [QuoteStatus.draft]: [QuoteStatus.sent],
    };

    if (allowedManualTransitions[currentStatus]?.includes(newStatus)) {
      const updateData: any = {
        status: newStatus,
      };

      if (newStatus === QuoteStatus.sent) {
        updateData.issuedAt = new Date();
      }
      const updatedQuote = await this.prisma.quote.update({
        where: { id },
        data: updateData,
        include: {
          variableValues: true,
        },
      });

      return plainToInstance(QuoteEntity, updatedQuote, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      });
    }

    throw new BadRequestException(
      `Transition du statut "${currentStatus}" vers "${newStatus}" non autorisée.`,
    );
  }

  async sendQuoteToClient(id: string, userId: string) {
    const user = await this.userService.getUserOrThrow(userId);
    const quote = await this.getQuoteOrThrow(id, userId);

    if (
      quote.status !== QuoteStatus.draft &&
      quote.status !== QuoteStatus.sent
    ) {
      throw new BadRequestException(
        `Impossible d’envoyer le devis : statut "${quote.status}".`,
      );
    }

    const client = await this.clientService.getClientOrThrow(
      quote.clientId,
      userId,
    );

    const pdfBuffer = await this.s3Service.getFileBuffer(quote.pdfKey);
    const clientName = `${client.firstName} ${client.lastName.toUpperCase()}`;

    await this.mailerService.sendQuoteByEmail(
      client.email,
      clientName,
      user,
      quote.number,
      pdfBuffer,
    );

    await this.changeStatus(id, userId, QuoteStatus.sent);

    return plainToInstance(ClientEntity, client);
  }
}
