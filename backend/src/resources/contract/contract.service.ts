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
import { buildSearchQuery } from 'src/common/utils/buildSearchQuery.util';
import { DocuSignService } from './docusign/docusign.service';
import { ClientEntity } from '../client/entities/client.entity';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateCSVExport } from 'src/common/utils/csv-export.util';

@Injectable()
export class ContractService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly contractTemplateService: ContractTemplateService,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly s3Service: S3Service,
    private readonly docusignService: DocuSignService,
  ) {}

  async create(
    userId: string,
    dto: CreateContractDto,
  ): Promise<ContractEntity> {
    const {
      clientId,
      templateId,
      generatedHtml,
      validUntil,
      variableValues,
      quoteId,
    } = dto;

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
        ...(quoteId ? { quote: { connect: { id: quoteId } } } : {}),
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
    const contract = await this.getContractOrThrow(id, userId);

    if (contract.pdfKey) {
      await this.s3Service.deleteFile(contract.pdfKey);
    }
    if (contract.previewKey) {
      await this.s3Service.deleteFile(contract.previewKey);
    }
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

  async search(
    userId: string,
    search: string,
    status?: ContractStatus,
    startDate?: Date,
    endDate?: Date,
    page?: number,
    pageSize?: number,
  ) {
    const baseWhere = buildSearchQuery(search, userId, 'contrat');

    const adjustedEndDate = endDate
      ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
      : undefined;

    const issuedAtFilter =
      startDate || adjustedEndDate
        ? {
            issuedAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(adjustedEndDate ? { lte: adjustedEndDate } : {}),
            },
          }
        : {};

    const where = {
      ...baseWhere,
      ...(status ? { status } : {}),
      ...issuedAtFilter,
    };

    const skip = page && pageSize ? (page - 1) * pageSize : undefined;
    const take = pageSize;

    const [contracts, totalCount] = await this.prisma.$transaction([
      this.prisma.contract.findMany({
        where,
        include: {
          variableValues: true,
          client: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        ...(skip !== undefined ? { skip } : {}),
        ...(take !== undefined ? { take } : {}),
      }),
      this.prisma.contract.count({ where }),
    ]);

    const contractsWithUrls = await Promise.all(
      contracts.map(async (contract) => ({
        ...contract,
        previewUrl: contract.previewKey
          ? await this.s3Service.generateSignedUrl(contract.previewKey)
          : null,
        pdfUrl: contract.pdfKey
          ? await this.s3Service.generateSignedUrl(contract.pdfKey)
          : null,
      })),
    );

    return {
      contract: plainToInstance(ContractEntity, contractsWithUrls, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      }),
      total: totalCount,
    };
  }

  async exportToCSV(
    userId: string,
    search: string,
    status?: ContractStatus,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ filename: string; content: string }> {
    const result = await this.search(
      userId,
      search,
      status,
      startDate,
      endDate,
    );

    const rows = result.contract.map((contract) => {
      const clientName =
        contract.variableValues?.find((v) => v.variableName === 'client_name')
          ?.value ?? 'Client inconnu';

      const base = {
        numero: contract.number,
        statut: contract.status,
        client: clientName,
        dateEmission: contract.issuedAt
          ? format(contract.issuedAt, 'dd/MM/yyyy', { locale: fr })
          : '',
        dateCreation: format(contract.createdAt, 'dd/MM/yyyy', { locale: fr }),
      };

      const variableColumns = contract.variableValues.reduce(
        (acc, v) => {
          acc[`var_${v.variableName}`] =
            `${v.value}${v.required ? ' (requis)' : ''}`;
          return acc;
        },
        {} as Record<string, string>,
      );

      return { ...base, ...variableColumns };
    });

    const staticColumns = {
      numero: 'Numéro',
      statut: 'Statut',
      client: 'Client',
      dateEmission: "Date d'émission",
      dateCreation: 'Date de création',
    };

    const dynamicVariableKeys = new Set<string>();
    result.contract.forEach((contract) =>
      contract.variableValues.forEach((v) =>
        dynamicVariableKeys.add(`var_${v.variableName}`),
      ),
    );

    const variableColumns = Array.from(dynamicVariableKeys).reduce(
      (acc, key) => {
        acc[key] = key.replace(/^var_/, 'Variable : ');
        return acc;
      },
      {} as Record<string, string>,
    );

    const { filename, content } = generateCSVExport({
      rows,
      columns: {
        ...staticColumns,
        ...variableColumns,
      },
      filenamePrefix: 'contrats_export',
      firstRowLabel: rows[0]?.client ?? 'inconnu',
    });

    return { filename, content };
  }

  async changeStatus(
    id: string,
    userId: string,
    newStatus: ContractStatus,
  ): Promise<ContractEntity> {
    const contract = await this.getContractOrThrow(id, userId);
    const currentStatus = contract.status;

    if (newStatus === currentStatus) {
      return plainToInstance(ContractEntity, contract, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
      });
    }

    const allowedTransitions: Record<ContractStatus, ContractStatus[]> = {
      [ContractStatus.draft]: [ContractStatus.sent],
      [ContractStatus.sent]: [
        ContractStatus.cancelled,
        ContractStatus.declined,
        ContractStatus.expired,
        ContractStatus.signed,
      ],
      [ContractStatus.cancelled]: [],
      [ContractStatus.declined]: [],
      [ContractStatus.expired]: [],
      [ContractStatus.signed]: [],
    };

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Transition du statut "${currentStatus}" vers "${newStatus}" non autorisée.`,
      );
    }

    const updateData: any = { status: newStatus };

    if (newStatus === ContractStatus.sent) {
      updateData.issuedAt = new Date();
    }

    const updatedContract = await this.prisma.contract.update({
      where: { id },
      data: updateData,
      include: { variableValues: true },
    });

    return plainToInstance(ContractEntity, updatedContract, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async sendForSignature(id: string, userId: string) {
    const user = await this.userService.getUserOrThrow(userId);
    const contract = await this.getContractOrThrow(id, userId);

    if (
      contract.status !== ContractStatus.draft &&
      contract.status !== ContractStatus.sent
    ) {
      throw new BadRequestException(
        `Impossible d’envoyer la facture : statut "${contract.status}".`,
      );
    }

    const client = await this.clientService.getClientOrThrow(
      contract.clientId,
      userId,
    );

    const newContract = await this.changeStatus(
      id,
      userId,
      ContractStatus.sent,
    );

    const html = newContract.generatedHtml
      .replace(
        /{{freelancer_signature}}/g,
        '<span style="color:white;font-size:1px;">{{freelancer_signature}}</span>',
      )
      .replace(
        /{{freelancer_fullname_signed}}/g,
        '<span style="color:white;font-size:1px;">{{freelancer_fullname_signed}}</span>',
      )
      .replace(
        /{{freelancer_date_signed}}/g,
        '<span style="color:white;font-size:1px;">{{freelancer_date_signed}}</span>',
      )
      .replace(
        /{{client_signature}}/g,
        '<span style="color:white;font-size:1px;">{{client_signature}}</span>',
      )
      .replace(
        /{{client_fullname_signed}}/g,
        '<span style="color:white;font-size:1px;">{{client_fullname_signed}}</span>',
      )
      .replace(
        /{{client_date_signed}}/g,
        '<span style="color:white;font-size:1px;">{{client_date_signed}}</span>',
      );

    const pdfBuffer = await this.pdfGeneratorService.generateFromHtml(html);
    const freelancerName = `${user.firstName} ${user.lastName ?? ''}`;
    const clientName = `${client.firstName} ${client.lastName ?? ''}`;

    const envelopeId = await this.docusignService.sendContractForSignature(
      pdfBuffer,
      user.email,
      freelancerName,
      client.email,
      clientName,
    );

    await this.prisma.contract.update({
      where: { id },
      data: {
        docusignEnvelopeId: envelopeId,
      },
    });

    return plainToInstance(ClientEntity, client);
  }
}
