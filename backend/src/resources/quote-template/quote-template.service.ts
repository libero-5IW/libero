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
import { QuoteTemplateVariableDto } from './dto/quote-template-variable.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class QuoteTemplateService {
  //variable temporaire pour simuler un vrai user
  //changer l'id selon le user existant
  DEFAULT_USER_ID = '52760094-6a72-45d9-9169-c77c50e70f43';

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(
    createQuoteTemplateDto: CreateQuoteTemplateDto,
  ): Promise<QuoteTemplateEntity> {
    const {
      name,
      contentHtml,
      userId = this.DEFAULT_USER_ID,
      variables = [],
    } = createQuoteTemplateDto;

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

    return plainToInstance(QuoteTemplateEntity, template);
  }

  async findAll(): Promise<QuoteTemplateEntity[]> {
    const template = await this.prisma.quoteTemplate.findMany({
      include: { variables: true },
    });

    return plainToInstance(QuoteTemplateEntity, template);
  }

  async findOne(id: string): Promise<QuoteTemplateEntity> {
    const template = await this.getTemplateOrThrow(id);
    return plainToInstance(QuoteTemplateEntity, template);
  }

  async update(
    id: string,
    updateQuoteTemplateDto: UpdateQuoteTemplateDto,
  ): Promise<QuoteTemplateEntity> {
    const { name, contentHtml, variables } = updateQuoteTemplateDto;

    await this.prisma.quoteTemplate.findUniqueOrThrow({ where: { id } });

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

    return plainToInstance(QuoteTemplateEntity, updatedTemplate);
  }

  async remove(id: string): Promise<QuoteTemplateEntity> {
    await this.getTemplateOrThrow(id);

    const deletedQuoteTemplate = await this.prisma.quoteTemplate.delete({
      where: { id },
    });

    return plainToInstance(QuoteTemplateEntity, deletedQuoteTemplate);
  }

  async duplicate(id: string): Promise<QuoteTemplateEntity> {
    const template = await this.getTemplateOrThrow(id);

    const name = await generateCopyName({
      table: 'quoteTemplate',
      nameField: 'name',
      baseName: template.name,
    });

    const duplicated = await this.prisma.quoteTemplate.create({
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

    return plainToInstance(QuoteTemplateEntity, duplicated);
  }

  private async getTemplateOrThrow(id: string) {
    const template = await this.prisma.quoteTemplate.findUnique({
      where: { id },
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
}
