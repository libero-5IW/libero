import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { ContractEntity } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { ContractTemplateService } from '../contract-template/contract-template.service';
import { ContractStatus, VariableType } from '@prisma/client';
import { generateNextNumber } from 'src/common/utils/generate-number.util';
import { CreateContractVariableValueDto } from './dto/create-contract-variable-value.dto';
import { ContractTemplateVariableEntity } from '../contract-template/entities/contract-template-variable.entity';

@Injectable()
export class ContractService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly contractTemplateService: ContractTemplateService,
  ) {}

  async create(userId: string, dto: CreateContractDto): Promise<ContractEntity> {
    const { clientId, templateId, generatedHtml, validUntil, variableValues } = dto;

    await this.userService.getUserOrThrow(userId);

    if (clientId) {
      await this.clientService.getClientOrThrow(clientId, userId);
    }

    const template = await this.contractTemplateService.findOne(templateId, userId);
    const nextNumber = await this.getNextContractNumber(userId);

    const contract = await this.prisma.contract.create({
      data: {
        number: nextNumber,
        template: { connect: { id: templateId } },
        user: { connect: { id: userId } },
        ...(clientId ? { client: { connect: { id: clientId } } } : {}),
        status: ContractStatus.draft,
        generatedHtml,
        validUntil: new Date(validUntil),
        issuedAt: null,
        variableValues: {
          create: this.mapVariableWithTemplateData(
            variableValues,
            template.variables,
            generatedHtml,
          ),
        },
      },
      include: { variableValues: true },
    });

    return plainToInstance(ContractEntity, contract, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async findAll(userId: string) {
    const contracts = await this.prisma.contract.findMany({
      where: { userId },
      include: { variableValues: true },
    });

    return plainToInstance(ContractEntity, contracts, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async findOne(id: string, userId: string) {
    const contract = await this.getContractOrThrow(id, userId);
    return plainToInstance(ContractEntity, contract);
  }

  async update(id: string, userId: string, dto: UpdateContractDto) {
    const { variableValues, ...otherData } = dto;
    const existing = await this.getContractOrThrow(id, userId);

    if (existing.status !== ContractStatus.draft) {
      throw new BadRequestException('Seuls les contrats en brouillon peuvent être modifiés.');
    }

    const template = await this.contractTemplateService.findOne(existing.templateId, userId);

    const preparedVariables = this.mapVariableWithTemplateData(
      variableValues ?? [],
      template.variables,
      existing.generatedHtml,
    );

    const updatedContract = await this.prisma.$transaction(async (tx) => {
      await tx.contractVariableValue.deleteMany({
        where: { contractId: id },
      });

      if (preparedVariables.length > 0) {
        await tx.contractVariableValue.createMany({
          data: preparedVariables.map((v) => ({
            contractId: id,
            variableName: v.variableName,
            value: v.value,
            label: v.label,
            type: v.type,
            required: v.required,
          })),
        });
      }

      return tx.contract.update({
        where: { id },
        data: { ...otherData },
        include: { variableValues: true },
      });
    });

    return plainToInstance(ContractEntity, updatedContract, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async remove(id: string, userId: string) {
    await this.getContractOrThrow(id, userId);
    const deleted = await this.prisma.contract.delete({ where: { id } });
    return plainToInstance(ContractEntity, deleted);
  }

  async getNextContractNumber(userId: string) {
    return generateNextNumber('contract', userId);
  }

  private async getContractOrThrow(id: string, userId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: { id, userId },
      include: { variableValues: true },
    });

    if (!contract) {
      throw new NotFoundException('Contrat non trouvé.');
    }

    return contract;
  }

  private mapVariableWithTemplateData(
    submitted: CreateContractVariableValueDto[],
    templateVars: ContractTemplateVariableEntity[],
    html: string,
  ) {
    const templateMap = new Map(
      templateVars.map((v) => [v.variableName, v]),
    );

    return submitted.map((v) => {
      const templateVar = templateMap.get(v.variableName);
      if (!templateVar) {
        throw new Error(`Variable ${v.variableName} non définie dans le template`);
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
}
