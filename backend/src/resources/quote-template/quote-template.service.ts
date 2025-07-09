import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuoteTemplateDto } from './dto/create-quote-template.dto';
import { UpdateQuoteTemplateDto } from './dto/update-quote-template.dto';
import { QuoteTemplateEntity } from './entities/quote-template.entity';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { generateCopyName } from 'src/common/utils/generate-copy-name.util';
import { mergeSystemVariables } from 'src/common/utils/merge-system-variables.util';
import { QuoteTemplateVariableDto } from './dto/quote-template-variable.dto';
import { UserService } from '../user/user.service';
import { VariableType } from 'src/common/enums/variable-type.enum';
import { buildTemplateSearchQuery } from 'src/common/utils/buildTemplateSearchQuery';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';

@Injectable()
export class QuoteTemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    userId: string,
    createQuoteTemplateDto: CreateQuoteTemplateDto,
  ): Promise<QuoteTemplateEntity> {
    const { name, contentHtml, variables = [] } = createQuoteTemplateDto;

    const user = await this.userService.getUserOrThrow(userId);

    const existingTemplate = await this.prisma.quoteTemplate.findFirst({
      where: { userId, name },
    });

    if (existingTemplate) {
      throw new BadRequestException('Un template avec ce nom existe déjà.');
    }

    const { pdfBuffer, previewBuffer } =
      await this.pdfGeneratorService.generatePdfAndPreview(contentHtml);

    const { pdfKey, previewKey } = await this.s3Service.uploadDocumentAssets(
      pdfBuffer,
      previewBuffer,
      user.email,
      'quote-templates',
    );

    const template = await this.prisma.quoteTemplate.create({
      data: {
        name,
        contentHtml,
        userId,
        pdfKey,
        previewKey,
        variables: {
          create: this.mapVariableData(variables),
        },
      },
      include: {
        variables: true,
      },
    });

    const mergedTemplate = this.mergeWithSystemVariables(template);

    return plainToInstance(QuoteTemplateEntity, mergedTemplate);
  }

  async findAll(
    userId: string,
    includeDefaultTemplate: boolean,
  ): Promise<QuoteTemplateEntity[]> {
    const whereClause = includeDefaultTemplate
      ? { OR: [{ userId }, { userId: null }] }
      : { userId };

    const templates = await this.prisma.quoteTemplate.findMany({
      where: whereClause,
      include: { variables: true },
    });

    const templatesWithUrls = await Promise.all(
      templates.map(async (template) => {
        const previewUrl = template.previewKey
          ? await this.s3Service.generateSignedUrl(template.previewKey)
          : null;

        const pdfUrl = template.pdfKey
          ? await this.s3Service.generateSignedUrl(template.pdfKey)
          : null;

        return {
          ...template,
          previewUrl,
          pdfUrl,
        };
      }),
    );

    const templatesWithSystemVariables = await Promise.all(
      templatesWithUrls.map((t) => this.mergeWithSystemVariables(t)),
    );

    return plainToInstance(QuoteTemplateEntity, templatesWithSystemVariables);
  }

  async findOne(id: string, userId: string): Promise<QuoteTemplateEntity> {
    const template = await this.getTemplateOrThrow(id, userId);

    const previewUrl = template.previewKey
      ? await this.s3Service.generateSignedUrl(template.previewKey)
      : null;

    const pdfUrl = template.pdfKey
      ? await this.s3Service.generateSignedUrl(template.pdfKey)
      : null;

    const templateWithSystemVariables = this.mergeWithSystemVariables({
      ...template,
      previewUrl,
      pdfUrl,
    });
    return plainToInstance(QuoteTemplateEntity, templateWithSystemVariables);
  }

  async update(
    id: string,
    userId: string,
    updateQuoteTemplateDto: UpdateQuoteTemplateDto,
  ): Promise<QuoteTemplateEntity> {
    const { name, contentHtml, variables } = updateQuoteTemplateDto;

    const existingTemplate = await this.getTemplateOrThrow(id, userId, {
      allowDefaultTemplate: false,
    });
    const user = await this.userService.getUserOrThrow(userId);

    if (existingTemplate.pdfKey) {
      await this.s3Service.deleteFile(existingTemplate.pdfKey);
    }
    if (existingTemplate.previewKey) {
      await this.s3Service.deleteFile(existingTemplate.previewKey);
    }

    const { pdfBuffer, previewBuffer } =
      await this.pdfGeneratorService.generatePdfAndPreview(contentHtml);

    const { pdfKey, previewKey } = await this.s3Service.uploadDocumentAssets(
      pdfBuffer,
      previewBuffer,
      user.email,
      'quote-templates',
    );

    const updatedTemplate = await this.prisma.$transaction(async (tx) => {
      if (variables?.length) {
        await tx.quoteTemplateVariable.deleteMany({
          where: { templateId: id },
        });

        await tx.quoteTemplateVariable.createMany({
          data: this.mapVariableData(variables).map((variable) => ({
            templateId: id,
            ...variable,
          })),
        });
      }

      return tx.quoteTemplate.update({
        where: { id },
        data: {
          name,
          contentHtml,
          pdfKey,
          previewKey,
        },
        include: {
          variables: true,
        },
      });
    });

    const templateWithSystemVariables =
      this.mergeWithSystemVariables(updatedTemplate);

    return plainToInstance(QuoteTemplateEntity, templateWithSystemVariables);
  }

  async remove(id: string, userId: string): Promise<QuoteTemplateEntity> {
    const template = await this.getTemplateOrThrow(id, userId, {
      allowDefaultTemplate: false,
    });

    if (template.pdfKey) {
      await this.s3Service.deleteFile(template.pdfKey);
    }
    if (template.previewKey) {
      await this.s3Service.deleteFile(template.previewKey);
    }
    const deletedQuoteTemplate = await this.prisma.quoteTemplate.delete({
      where: { id },
    });

    return plainToInstance(QuoteTemplateEntity, deletedQuoteTemplate);
  }

  async duplicate(id: string, userId: string): Promise<QuoteTemplateEntity> {
    const template = await this.getTemplateOrThrow(id, userId);

    const name = await generateCopyName({
      table: 'quoteTemplate',
      nameField: 'name',
      baseName: template.name,
    });

    const user = await this.userService.getUserOrThrow(userId);

    const { pdfBuffer, previewBuffer } =
      await this.pdfGeneratorService.generatePdfAndPreview(
        template.contentHtml,
      );

    const { pdfKey, previewKey } = await this.s3Service.uploadDocumentAssets(
      pdfBuffer,
      previewBuffer,
      user.email,
      'quote-templates',
    );

    const duplicatedTemplate = await this.prisma.quoteTemplate.create({
      data: {
        name,
        contentHtml: template.contentHtml,
        userId,
        pdfKey: pdfKey,
        previewKey: previewKey,
        variables: { create: this.mapVariableData(template.variables) },
      },
      include: {
        variables: true,
      },
    });

    const templateWithSystemVariables =
      this.mergeWithSystemVariables(duplicatedTemplate);

    return plainToInstance(QuoteTemplateEntity, templateWithSystemVariables);
  }

  async getDefaultTemplate() {
    return this.prisma.quoteTemplate.findUnique({
      where: { id: 'defaultTemplate' },
      include: { variables: true },
    });
  }

  async getTemplateOrThrow(
    id: string,
    userId: string,
    options?: { allowDefaultTemplate?: boolean },
  ) {
    const template = await this.prisma.quoteTemplate.findFirst({
      where: {
        id,
        OR: [{ userId }, { userId: null }],
      },
      include: { variables: true },
    });

    if (
      !template ||
      (id === 'defaultTemplate' && options?.allowDefaultTemplate === false)
    ) {
      throw new NotFoundException("Le template du devis n'a pas été trouvé.");
    }

    return template;
  }

  private mapVariableData(variables: QuoteTemplateVariableDto[]) {
    return variables.map((v) => ({
      variableName: v.variableName,
      label: v.label,
      type: v.type as VariableType,
      required: v.required,
    }));
  }

  private mergeWithSystemVariables(template: QuoteTemplateEntity) {
    return mergeSystemVariables(template, 'quoteTemplateVariable');
  }

  async search(
    userId: string,
    rawSearch: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<QuoteTemplateEntity[]> {
    const baseWhere = buildTemplateSearchQuery(rawSearch, userId);
  
    const whereClause = {
      ...baseWhere,
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? {
                lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
              } : {})
            }
          }
        : {})
    };
  
    const templates = await this.prisma.quoteTemplate.findMany({
      where: whereClause,
      include: { variables: true },
    });
  
    const templatesWithUrls = await Promise.all(
      templates.map(async (template) => {
        const previewUrl = template.previewKey
          ? await this.s3Service.generateSignedUrl(template.previewKey)
          : null;
  
        const pdfUrl = template.pdfKey
          ? await this.s3Service.generateSignedUrl(template.pdfKey)
          : null;
  
        return {
          ...template,
          previewUrl,
          pdfUrl,
        };
      }),
    );
  
    const templatesWithSystemVariables = await Promise.all(
      templatesWithUrls.map((t) => this.mergeWithSystemVariables(t)),
    );
  
    return plainToInstance(QuoteTemplateEntity, templatesWithSystemVariables);
  }
  
}
