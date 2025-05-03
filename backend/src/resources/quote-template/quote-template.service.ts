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
import { QUOTE_VARIABLES_SYSTEM } from 'src/common/constants/system-variables';

@Injectable()
export class QuoteTemplateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(
    userId: string,
    createQuoteTemplateDto: CreateQuoteTemplateDto,
  ): Promise<QuoteTemplateEntity> {
    const { name, contentHtml, variables = [] } = createQuoteTemplateDto;

    await this.userService.getUserOrThrow(userId);

    const existingTemplate = await this.prisma.quoteTemplate.findFirst({
      where: { userId, name },
    });

    if (existingTemplate) {
      throw new BadRequestException('Un template avec ce nom existe déjà.');
    }

    const template = await this.prisma.quoteTemplate.create({
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

    return plainToInstance(QuoteTemplateEntity, templateWithSystemVariables);
  }

  async findAll(userId: string): Promise<QuoteTemplateEntity[]> {
    const templates = await this.prisma.quoteTemplate.findMany({
      where: { userId },
      include: { variables: true },
    });
    const templatesWithSystemVariables = templates.map(
      this.mergeWithSystemVariables,
    );

    return plainToInstance(QuoteTemplateEntity, templatesWithSystemVariables);
  }

  async findOne(id: string, userId: string): Promise<QuoteTemplateEntity> {
    const template = await this.getTemplateOrThrow(id, userId);
    const templateWithSystemVariables = this.mergeWithSystemVariables(template);
    return plainToInstance(QuoteTemplateEntity, templateWithSystemVariables);
  }

  async update(
    id: string,
    userId: string,
    updateQuoteTemplateDto: UpdateQuoteTemplateDto,
  ): Promise<QuoteTemplateEntity> {
    const { name, contentHtml, variables } = updateQuoteTemplateDto;

    await this.getTemplateOrThrow(id, userId);

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
    await this.getTemplateOrThrow(id, userId);

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

    const duplicatedTemplate = await this.prisma.quoteTemplate.create({
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

    return plainToInstance(QuoteTemplateEntity, templateWithSystemVariables);
  }

  private async getTemplateOrThrow(id: string, userId: string) {
    const template = await this.prisma.quoteTemplate.findFirst({
      where: { id, userId },
      include: { variables: true },
    });

    if (!template) {
      throw new NotFoundException("Le template du devis n'a pas été trouvé.");
    }

    return template;
  }

  private mapVariableData(variables: QuoteTemplateVariableDto[]) {
    return variables.map((v) => ({
      variableName: v.variableName,
      label: v.label,
      type: v.type,
      required: v.required,
    }));
  }

  private mergeWithSystemVariables(template: QuoteTemplateEntity) {
    return mergeSystemVariables(template, QUOTE_VARIABLES_SYSTEM);
  }
}
