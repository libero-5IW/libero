import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvoiceTemplateDto } from './dto/create-invoice-template.dto';
import { UpdateInvoiceTemplateDto } from './dto/update-invoice-template.dto';
import { InvoiceTemplateEntity } from './entities/invoice-template.entity';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { generateCopyName } from 'src/common/utils/generate-copy-name.util';
import { mergeSystemVariables } from 'src/common/utils/merge-system-variables.util';
import { InvoiceTemplateVariableDto } from './dto/invoice-template-variable.dto';
import { UserService } from '../user/user.service';
import { VariableType } from 'src/common/enums/variable-type.enum';
import { buildTemplateSearchQuery } from 'src/common/utils/buildTemplateSearchQuery';
import { S3Service } from 'src/common/s3/s3.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';

@Injectable()
export class InvoiceTemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    userId: string,
    createInvoiceTemplateDto: CreateInvoiceTemplateDto,
  ): Promise<InvoiceTemplateEntity> {
    const { name, contentHtml, variables = [] } = createInvoiceTemplateDto;

    const user = await this.userService.getUserOrThrow(userId);

    const existingTemplate = await this.prisma.invoiceTemplate.findFirst({
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
      'invoice-templates',
    );

    const template = await this.prisma.invoiceTemplate.create({
      data: {
        name,
        contentHtml,
        userId,
        pdfKey,
        previewKey,
        variables: { create: this.mapVariableData(variables) },
      },
      include: {
        variables: true,
      },
    });

    const mergedTemplate = this.mergeWithSystemVariables(template);

    return plainToInstance(InvoiceTemplateEntity, mergedTemplate);
  }

  async findAll(
    userId: string,
    includeDefaultTemplate: boolean,
  ): Promise<InvoiceTemplateEntity[]> {
    const whereClause = includeDefaultTemplate
      ? { OR: [{ userId }, { userId: null }] }
      : { userId };

    const templates = await this.prisma.invoiceTemplate.findMany({
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

    return plainToInstance(InvoiceTemplateEntity, templatesWithSystemVariables);
  }

  async findOne(id: string, userId: string): Promise<InvoiceTemplateEntity> {
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
    return plainToInstance(InvoiceTemplateEntity, templateWithSystemVariables);
  }

  async update(
    id: string,
    userId: string,
    updateInvoiceTemplateDto: UpdateInvoiceTemplateDto,
  ): Promise<InvoiceTemplateEntity> {
    const { name, contentHtml, variables } = updateInvoiceTemplateDto;

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
      'invoice-templates',
    );

    const updatedTemplate = await this.prisma.$transaction(async (tx) => {
      await tx.invoiceTemplateVariable.deleteMany({
        where: { templateId: id },
      });

      if (variables?.length > 0) {
        await tx.invoiceTemplateVariable.createMany({
          data: this.mapVariableData(variables).map((variable) => ({
            templateId: id,
            ...variable,
          })),
        });
      }

      return tx.invoiceTemplate.update({
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

    return plainToInstance(InvoiceTemplateEntity, templateWithSystemVariables);
  }

  async remove(id: string, userId: string): Promise<InvoiceTemplateEntity> {
    const template = await this.getTemplateOrThrow(id, userId, {
      allowDefaultTemplate: false,
    });

    if (template.pdfKey) {
      await this.s3Service.deleteFile(template.pdfKey);
    }
    if (template.previewKey) {
      await this.s3Service.deleteFile(template.previewKey);
    }
    const deletedTemplate = await this.prisma.invoiceTemplate.delete({
      where: { id },
    });

    return plainToInstance(InvoiceTemplateEntity, deletedTemplate);
  }

  async duplicate(id: string, userId: string): Promise<InvoiceTemplateEntity> {
    const template = await this.getTemplateOrThrow(id, userId);

    const name = await generateCopyName({
      table: 'invoiceTemplate',
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
      'invoice-templates',
    );

    const duplicatedTemplate = await this.prisma.invoiceTemplate.create({
      data: {
        name,
        contentHtml: template.contentHtml,
        userId,
        pdfKey,
        previewKey,
        variables: { create: this.mapVariableData(template.variables) },
      },
      include: {
        variables: true,
      },
    });

    const templateWithSystemVariables =
      this.mergeWithSystemVariables(duplicatedTemplate);

    return plainToInstance(InvoiceTemplateEntity, templateWithSystemVariables);
  }

  async getDefaultTemplate() {
    return this.prisma.invoiceTemplate.findUnique({
      where: { id: 'defaultTemplate' },
      include: { variables: true },
    });
  }

  async getTemplateOrThrow(
    id: string,
    userId: string,
    options?: { allowDefaultTemplate?: boolean },
  ) {
    const template = await this.prisma.invoiceTemplate.findFirst({
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
      throw new NotFoundException("Le template de facture n'a pas été trouvé.");
    }

    return template;
  }

  private mapVariableData(variables: InvoiceTemplateVariableDto[]) {
    return variables.map((v) => ({
      variableName: v.variableName,
      label: v.label,
      type: v.type as VariableType,
      required: v.required,
    }));
  }

  private mergeWithSystemVariables(template: InvoiceTemplateEntity) {
    return mergeSystemVariables(template, 'invoiceTemplateVariable');
  }

  async search(
    userId: string,
    rawSearch: string,
    startDate?: Date,
    endDate?: Date,
    page?: number,
    pageSize?: number,
  ) {
    const baseWhere = buildTemplateSearchQuery(rawSearch, userId);
  
    const adjustedEndDate = endDate
      ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
      : undefined;
  
    const createdAtFilter =
      startDate || adjustedEndDate
        ? {
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(adjustedEndDate ? { lte: adjustedEndDate } : {}),
            },
          }
        : {};
  
    const where = {
      ...baseWhere,
      ...createdAtFilter,
    };
  
    const skip = page && pageSize ? (page - 1) * pageSize : undefined;
    const take = pageSize;
  
    const [templates, totalCount] = await this.prisma.$transaction([
      this.prisma.invoiceTemplate.findMany({
        where,
        include: { variables: true },
        orderBy: { createdAt: 'desc' },
        ...(skip !== undefined ? { skip } : {}),
        ...(take !== undefined ? { take } : {}),
      }),
      this.prisma.invoiceTemplate.count({ where }),
    ]);
  
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
  
    return {
      invoiceTemplate: plainToInstance(InvoiceTemplateEntity, templatesWithSystemVariables),
      total: totalCount,
    };
  }
    
}
