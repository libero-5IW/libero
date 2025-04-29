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
import { INVOICE_VARIABLES_SYSTEM } from 'src/common/constants/system-variables';
import { DEFAULT_INVOICE_TEMPLATE } from 'src/common/constants/system-templates/defaultInvoiceTemplate';


@Injectable()
export class InvoiceTemplateService {
  DEFAULT_USER_ID = 'e0f77fd1-d9ff-4875-ad81-ebd3338f1a4c';

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(
    createInvoiceTemplateDto: CreateInvoiceTemplateDto,
  ): Promise<InvoiceTemplateEntity> {
    const {
      name,
      contentHtml,
      userId = this.DEFAULT_USER_ID,
      variables = [],
    } = createInvoiceTemplateDto;

    await this.userService.getUserOrThrow(userId);

    const existingTemplate = await this.prisma.invoiceTemplate.findFirst({
      where: { userId, name },
    });

    if (existingTemplate) {
      throw new BadRequestException('Un template avec ce nom existe déjà.');
    }

    const template = await this.prisma.invoiceTemplate.create({
      data: {
        name,
        contentHtml,
        userId,
        variables: { create: this.mapVariableData(variables) },
      },
      include: {
        variables: true,
      },
    });

    const templateWithSystemVariables = this.mergeWithSystemVariables(template);

    return plainToInstance(InvoiceTemplateEntity, templateWithSystemVariables);
  }

  async findAll(): Promise<InvoiceTemplateEntity[]> {
    const templates = await this.prisma.invoiceTemplate.findMany({
      include: { variables: true },
    });

    const templatesWithSystemVariables = templates.map(
      this.mergeWithSystemVariables,
    );

    return plainToInstance(InvoiceTemplateEntity, templatesWithSystemVariables);
  }

  async findOne(id: string): Promise<InvoiceTemplateEntity> {
    const template = await this.getTemplateOrThrow(id);
    const templateWithSystemVariables = this.mergeWithSystemVariables(template);
    return plainToInstance(InvoiceTemplateEntity, templateWithSystemVariables);
  }

  async update(
    id: string,
    updateInvoiceTemplateDto: UpdateInvoiceTemplateDto,
  ): Promise<InvoiceTemplateEntity> {
    const { name, contentHtml, variables } = updateInvoiceTemplateDto;

    await this.prisma.invoiceTemplate.findUniqueOrThrow({ where: { id } });

    const updatedTemplate = await this.prisma.$transaction(async (tx) => {
      if (variables?.length) {
        await tx.invoiceTemplateVariable.deleteMany({
          where: { templateId: id },
        });

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

  async remove(id: string): Promise<InvoiceTemplateEntity> {
    await this.getTemplateOrThrow(id);

    const deletedTemplate = await this.prisma.invoiceTemplate.delete({
      where: { id },
    });

    return plainToInstance(InvoiceTemplateEntity, deletedTemplate);
  }

  async duplicate(id: string): Promise<InvoiceTemplateEntity> {
    const template = await this.getTemplateOrThrow(id);

    const name = await generateCopyName({
      table: 'invoiceTemplate',
      nameField: 'name',
      baseName: template.name,
    });

    const duplicatedTemplate = await this.prisma.invoiceTemplate.create({
      data: {
        name,
        contentHtml: template.contentHtml,
        userId: template.userId,
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

  private async getTemplateOrThrow(id: string) {
    const template = await this.prisma.invoiceTemplate.findUnique({
      where: { id },
      include: { variables: true },
    });

    if (!template) {
      throw new NotFoundException("Le template de facture n'a pas été trouvé.");
    }

    return template;
  }

  async getDefaultTemplate(): Promise<InvoiceTemplateEntity> {
    const DefaultTemplate: InvoiceTemplateEntity = {
      id: DEFAULT_INVOICE_TEMPLATE.id,
      name: DEFAULT_INVOICE_TEMPLATE.name,
      contentHtml: DEFAULT_INVOICE_TEMPLATE.contentHtml,
      userId: this.DEFAULT_USER_ID,
      createdAt: new Date(),
      updatedAt: new Date(),
      variables: DEFAULT_INVOICE_TEMPLATE.variables.map((v, index) => ({
        id: `${index}`,
        templateId: DEFAULT_INVOICE_TEMPLATE.id,
        variableName: v.variableName,
        label: v.label,
        type: v.type,
        required: v.required,
      })),
    };
  
    return plainToInstance(InvoiceTemplateEntity, DefaultTemplate);
  }
  
  private mapVariableData(variables: InvoiceTemplateVariableDto[]) {
    return variables.map((v) => ({
      variableName: v.variableName,
      label: v.label,
      type: v.type,
      required: v.required,
    }));
  }

  private mergeWithSystemVariables(template: InvoiceTemplateEntity) {
    return mergeSystemVariables(template, INVOICE_VARIABLES_SYSTEM);
  }
}
