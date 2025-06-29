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
import { S3Service } from 'src/common/s3/s3.service';
import { PdfGeneratorService } from 'src/common/pdf/pdf-generator.service';

@Injectable()
export class ContractService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly contractTemplateService: ContractTemplateService,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    userId: string,
    dto: CreateContractDto,
  ): Promise<ContractEntity> {
    const { clientId, templateId, generatedHtml, validUntil, variableValues } =
      dto;

    const user = await this.userService.getUserOrThrow(userId);

    if (clientId) {
      await this.clientService.getClientOrThrow(clientId, userId);
    }

    const template = await this.contractTemplateService.findOne(
      templateId,
      userId,
    );
    const nextNumber = await this.getNextContractNumber(userId);

    const { pdfBuffer, previewBuffer } =
      await this.pdfGeneratorService.generatePdfAndPreview(generatedHtml);

    const { pdfKey, previewKey } = await this.s3Service.uploadDocumentAssets(
      pdfBuffer,
      previewBuffer,
      user.email,
      'contracts',
    );

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
        pdfKey,
        previewKey,
        variableValues: {
          create: this.mapVariableWithTemplateData(
            variableValues,
            template.variables,
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

    const contractsWithUrls = await Promise.all(
      contracts.map(async (contract) => {
        const previewUrl = contract.previewKey
          ? await this.s3Service.generateSignedUrl(contract.previewKey)
          : null;

        const pdfUrl = contract.pdfKey
          ? await this.s3Service.generateSignedUrl(contract.pdfKey)
          : null;

        return {
          ...contract,
          previewUrl,
          pdfUrl,
        };
      }),
    );

    return plainToInstance(ContractEntity, contractsWithUrls, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async findOne(id: string, userId: string) {
    const contract = await this.getContractOrThrow(id, userId);

    const previewUrl = contract.previewKey
      ? await this.s3Service.generateSignedUrl(contract.previewKey)
      : null;

    const pdfUrl = contract.pdfKey
      ? await this.s3Service.generateSignedUrl(contract.pdfKey)
      : null;
    return plainToInstance(ContractEntity, { ...contract, previewUrl, pdfUrl });
  }

  async update(id: string, userId: string, dto: UpdateContractDto) {
    const { variableValues, ...otherData } = dto;
    const existing = await this.getContractOrThrow(id, userId);

    if (existing.status !== ContractStatus.draft) {
      throw new BadRequestException(
        'Seuls les contrats en brouillon peuvent être modifiés.',
      );
    }

    const template = await this.contractTemplateService.findOne(
      existing.templateId,
      userId,
    );

    const preparedVariables = this.mapVariableWithTemplateData(
      variableValues ?? [],
      template.variables,
    );

    const user = await this.userService.getUserOrThrow(userId);

    if (existing.pdfKey) {
      await this.s3Service.deleteFile(existing.pdfKey);
    }
    if (existing.previewKey) {
      await this.s3Service.deleteFile(existing.previewKey);
    }

    const { pdfBuffer, previewBuffer } =
      await this.pdfGeneratorService.generatePdfAndPreview(
        otherData.generatedHtml,
      );

    const { pdfKey, previewKey } = await this.s3Service.uploadDocumentAssets(
      pdfBuffer,
      previewBuffer,
      user.email,
      'contracts',
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
        data: { ...otherData, pdfKey, previewKey },
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
  ) {
    const templateMap = new Map(templateVars.map((v) => [v.variableName, v]));

    return submitted.map((v) => {
      const templateVar = templateMap.get(v.variableName);
      if (!templateVar) {
        throw new Error(
          `Variable ${v.variableName} non définie dans le template`,
        );
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
