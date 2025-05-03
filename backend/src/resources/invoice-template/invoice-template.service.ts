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

@Injectable()
export class InvoiceTemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(
    userId: string,
    createInvoiceTemplateDto: CreateInvoiceTemplateDto,
  ): Promise<InvoiceTemplateEntity> {
    const { name, contentHtml, variables = [] } = createInvoiceTemplateDto;

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

  async findAll(userId: string): Promise<InvoiceTemplateEntity[]> {
    const templates = await this.prisma.invoiceTemplate.findMany({
      where: { userId },
      include: { variables: true },
    });

    const templatesWithSystemVariables = templates.map(
      this.mergeWithSystemVariables,
    );

    return plainToInstance(InvoiceTemplateEntity, templatesWithSystemVariables);
  }

  async findOne(id: string, userId: string): Promise<InvoiceTemplateEntity> {
    const template = await this.getTemplateOrThrow(id, userId);
    const templateWithSystemVariables = this.mergeWithSystemVariables(template);
    return plainToInstance(InvoiceTemplateEntity, templateWithSystemVariables);
  }

  async update(
    id: string,
    userId: string,
    updateInvoiceTemplateDto: UpdateInvoiceTemplateDto,
  ): Promise<InvoiceTemplateEntity> {
    const { name, contentHtml, variables } = updateInvoiceTemplateDto;

    await this.getTemplateOrThrow(id, userId);

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

  async remove(id: string, userId: string): Promise<InvoiceTemplateEntity> {
    await this.getTemplateOrThrow(id, userId);

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

    const duplicatedTemplate = await this.prisma.invoiceTemplate.create({
      data: {
        name,
        contentHtml: template.contentHtml,
        userId,
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

  private async getTemplateOrThrow(id: string, userId: string) {
    const template = await this.prisma.invoiceTemplate.findUnique({
      where: { id, userId },
      include: { variables: true },
    });

    if (!template) {
      throw new NotFoundException("Le template de facture n'a pas été trouvé.");
    }

    return template;
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
