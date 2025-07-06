import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContractTemplateDto } from './dto/create-contract-template.dto';
import { UpdateContractTemplateDto } from './dto/update-contract-template.dto';
import { ContractTemplateEntity } from './entities/contract-template.entity';
import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { generateCopyName } from 'src/common/utils/generate-copy-name.util';
import { mergeSystemVariables } from 'src/common/utils/merge-system-variables.util';
import { ContractTemplateVariableDto } from './dto/contract-template-variable.dto';
import { UserService } from '../user/user.service';
import { VariableType } from 'src/common/enums/variable-type.enum';
import { buildTemplateSearchQuery } from 'src/common/utils/buildTemplateSearchQuery';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';
import { S3Service } from 'src/common/s3/s3.service';

@Injectable()
export class ContractTemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    userId: string,
    createContractTemplateDto: CreateContractTemplateDto,
  ): Promise<ContractTemplateEntity> {
    const { name, contentHtml, variables = [] } = createContractTemplateDto;

    const user = await this.userService.getUserOrThrow(userId);

    const existingTemplate = await this.prisma.contractTemplate.findFirst({
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
      'contract-templates',
    );

    const template = await this.prisma.contractTemplate.create({
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

    return plainToInstance(ContractTemplateEntity, mergedTemplate);
  }

  async findAll(
    userId: string,
    includeDefaultTemplate: boolean,
  ): Promise<ContractTemplateEntity[]> {
    const whereClause = includeDefaultTemplate
      ? { OR: [{ userId }, { userId: null }] }
      : { userId };

    const templates = await this.prisma.contractTemplate.findMany({
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

    return plainToInstance(
      ContractTemplateEntity,
      templatesWithSystemVariables,
    );
  }

  async findOne(id: string, userId: string): Promise<ContractTemplateEntity> {
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
    return plainToInstance(ContractTemplateEntity, templateWithSystemVariables);
  }

  async update(
    id: string,
    userId: string,
    updateContractTemplateDto: UpdateContractTemplateDto,
  ): Promise<ContractTemplateEntity> {
    const { name, contentHtml, variables } = updateContractTemplateDto;

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
      'contract-templates',
    );

    const updatedTemplate = await this.prisma.$transaction(async (tx) => {
      await tx.contractTemplateVariable.deleteMany({
        where: { templateId: id },
      });

      if (variables?.length > 0) {
        await tx.contractTemplateVariable.createMany({
          data: this.mapVariableData(variables).map((variable) => ({
            templateId: id,
            ...variable,
          })),
        });
      }

      return tx.contractTemplate.update({
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

    return plainToInstance(ContractTemplateEntity, templateWithSystemVariables);
  }

  async remove(id: string, userId: string): Promise<ContractTemplateEntity> {
    const template = await this.getTemplateOrThrow(id, userId, {
      allowDefaultTemplate: false,
    });

    if (template.pdfKey) {
      await this.s3Service.deleteFile(template.pdfKey);
    }
    if (template.previewKey) {
      await this.s3Service.deleteFile(template.previewKey);
    }
    const deletedTemplate = await this.prisma.contractTemplate.delete({
      where: { id },
    });

    return plainToInstance(ContractTemplateEntity, deletedTemplate);
  }

  async duplicate(id: string, userId: string): Promise<ContractTemplateEntity> {
    const template = await this.getTemplateOrThrow(id, userId);

    const name = await generateCopyName({
      table: 'contractTemplate',
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
      'contract-templates',
    );

    const duplicatedTemplate = await this.prisma.contractTemplate.create({
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

    return plainToInstance(ContractTemplateEntity, templateWithSystemVariables);
  }

  async getDefaultTemplate() {
    return this.prisma.contractTemplate.findUnique({
      where: { id: 'defaultTemplate' },
      include: { variables: true },
    });
  }

  async getTemplateOrThrow(
    id: string,
    userId: string,
    options?: { allowDefaultTemplate?: boolean },
  ) {
    const template = await this.prisma.contractTemplate.findFirst({
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
      throw new NotFoundException("Le template de contrat n'a pas été trouvé.");
    }

    return template;
  }

  private mapVariableData(variables: ContractTemplateVariableDto[]) {
    return variables.map((v) => ({
      variableName: v.variableName,
      label: v.label,
      type: v.type as VariableType,
      required: v.required,
    }));
  }

  private mergeWithSystemVariables(template: ContractTemplateEntity) {
    return mergeSystemVariables(template, 'contractTemplateVariable');
  }

  async search(
    userId: string,
    rawSearch: string,
  ): Promise<ContractTemplateEntity[]> {
    const whereClause = buildTemplateSearchQuery(rawSearch, userId);

    const templates = await this.prisma.contractTemplate.findMany({
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

    return plainToInstance(
      ContractTemplateEntity,
      templatesWithSystemVariables,
    );
  }
}
