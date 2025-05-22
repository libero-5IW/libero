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

@Injectable()
export class ContractTemplateService {
  DEFAULT_USER_ID = 'e0f77fd1-d9ff-4875-ad81-ebd3338f1a4c';

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(
    userId: string,
    createContractTemplateDto: CreateContractTemplateDto,
  ): Promise<ContractTemplateEntity> {
    const { name, contentHtml, variables = [] } = createContractTemplateDto;

    await this.userService.getUserOrThrow(userId);

    const existingTemplate = await this.prisma.contractTemplate.findFirst({
      where: { userId, name },
    });

    if (existingTemplate) {
      throw new BadRequestException('Un template avec ce nom existe déjà.');
    }

    const template = await this.prisma.contractTemplate.create({
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

    return plainToInstance(ContractTemplateEntity, templateWithSystemVariables);
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
    const templatesWithSystemVariables = await Promise.all(
      templates.map((t) => this.mergeWithSystemVariables(t)),
    );

    return plainToInstance(
      ContractTemplateEntity,
      templatesWithSystemVariables,
    );
  }

  async findOne(id: string, userId: string): Promise<ContractTemplateEntity> {
    const template = await this.getTemplateOrThrow(id, userId);
    const templateWithSystemVariables = this.mergeWithSystemVariables(template);
    return plainToInstance(ContractTemplateEntity, templateWithSystemVariables);
  }

  async update(
    id: string,
    userId: string,
    updateContractTemplateDto: UpdateContractTemplateDto,
  ): Promise<ContractTemplateEntity> {
    const { name, contentHtml, variables } = updateContractTemplateDto;

    await this.getTemplateOrThrow(id, userId, { allowDefaultTemplate: false });

    const updatedTemplate = await this.prisma.$transaction(async (tx) => {
      if (variables?.length) {
        await tx.contractTemplateVariable.deleteMany({
          where: { templateId: id },
        });

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
    await this.getTemplateOrThrow(id, userId, { allowDefaultTemplate: false });

    const deletedContractTemplate = await this.prisma.contractTemplate.delete({
      where: { id },
    });

    return plainToInstance(ContractTemplateEntity, deletedContractTemplate);
  }

  async duplicate(id: string, userId: string): Promise<ContractTemplateEntity> {
    const template = await this.getTemplateOrThrow(id, userId);

    const name = await generateCopyName({
      table: 'contractTemplate',
      nameField: 'name',
      baseName: template.name,
    });

    const duplicatedTemplate = await this.prisma.contractTemplate.create({
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

    return plainToInstance(ContractTemplateEntity, templateWithSystemVariables);
  }

  async getDefaultTemplate() {
    return this.prisma.contractTemplate.findUnique({
      where: { id: 'defaultTemplate' },
      include: { variables: true },
    });
  }

  private async getTemplateOrThrow(
    id: string,
    userId: string,
    options?: { allowDefaultTemplate?: boolean },
  ) {
    const template = await this.prisma.contractTemplate.findFirst({
      where: { id, userId },
      include: { variables: true },
    });

    if (
      !template ||
      (id === 'defaultTemplate' && options?.allowDefaultTemplate === false)
    ) {
      throw new NotFoundException("Le template du contrat n'a pas été trouvé.");
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
}
