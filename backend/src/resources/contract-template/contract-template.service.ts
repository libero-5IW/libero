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
import { CONTRACT_VARIABLES_SYSTEM } from 'src/common/constants/system-variables';

@Injectable()
export class ContractTemplateService {
  DEFAULT_USER_ID = 'e0f77fd1-d9ff-4875-ad81-ebd3338f1a4c';

  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(
    createContractTemplateDto: CreateContractTemplateDto,
  ): Promise<ContractTemplateEntity> {
    const {
      name,
      contentHtml,
      userId = this.DEFAULT_USER_ID,
      variables = [],
    } = createContractTemplateDto;

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

    const templateWithSystemVariables =
      this.mergeWithSystemVariables(template);

    return plainToInstance(ContractTemplateEntity, templateWithSystemVariables);
  }

  async findAll(): Promise<ContractTemplateEntity[]> {
    const templates = await this.prisma.contractTemplate.findMany({
      include: { variables: true },
    });
    const templatesWithSystemVariables = templates.map(
      this.mergeWithSystemVariables,
    );

    return plainToInstance(ContractTemplateEntity, templatesWithSystemVariables);
  }

  async findOne(id: string): Promise<ContractTemplateEntity> {
    const template = await this.getTemplateOrThrow(id);
    const templateWithSystemVariables =
      this.mergeWithSystemVariables(template);
    return plainToInstance(ContractTemplateEntity, templateWithSystemVariables);
  }

  async update(
    id: string,
    updateContractTemplateDto: UpdateContractTemplateDto,
  ): Promise<ContractTemplateEntity> {
    const { name, contentHtml, variables } = updateContractTemplateDto;

    await this.prisma.contractTemplate.findUniqueOrThrow({ where: { id } });

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

  async remove(id: string): Promise<ContractTemplateEntity> {
    await this.getTemplateOrThrow(id);

    const deletedContractTemplate = await this.prisma.contractTemplate.delete({
      where: { id },
    });

    return plainToInstance(ContractTemplateEntity, deletedContractTemplate);
  }

  async duplicate(id: string): Promise<ContractTemplateEntity> {
    const template = await this.getTemplateOrThrow(id);

    const name = await generateCopyName({
      table: 'contractTemplate',
      nameField: 'name',
      baseName: template.name,
    });

    const duplicatedTemplate = await this.prisma.contractTemplate.create({
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

    return plainToInstance(ContractTemplateEntity, templateWithSystemVariables);
  }

  private async getTemplateOrThrow(id: string) {
    const template = await this.prisma.contractTemplate.findUnique({
      where: { id },
      include: { variables: true },
    });

    if (!template) {
      throw new NotFoundException("Le template du contrat n'a pas été trouvé.");
    }

    return template;
  }

  private mapVariableData(variables: ContractTemplateVariableDto[]) {
    return variables.map((v) => ({
      variableName: v.variableName,
      label: v.label,
      type: v.type,
      required: v.required,
    }));
  }

  private mergeWithSystemVariables(template: ContractTemplateEntity) {
    return mergeSystemVariables(template, CONTRACT_VARIABLES_SYSTEM);
  }
}
