import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { plainToInstance } from 'class-transformer';
import { QuoteEntity } from './entities/quote.entity';
import { UserService } from '../user/user.service';
import { ClientService } from '../client/client.service';
import { QuoteTemplateService } from '../quote-template/quote-template.service';
import { QuoteStatus, VariableType } from '@prisma/client';
import { generateNextNumber } from 'src/common/utils/generate-number.util';
import { CreateQuoteVariableValueDto } from './dto/create-quote-variable-value.dto';
import { QuoteTemplateVariableEntity } from '../quote-template/entities/quote-template-variable.entity';
import { extractVariablesFromHtml } from 'src/common/utils/variable-parser.util';

@Injectable()
export class QuoteService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly quoteTemplateService: QuoteTemplateService,
  ) {}

  async create(
    userId: string,
    createQuoteDto: CreateQuoteDto,
  ): Promise<QuoteEntity> {
    const { clientId, templateId, generatedHtml, validUntil, variableValues } =
      createQuoteDto;

    await this.userService.getUserOrThrow(userId);
    await this.clientService.getClientOrThrow(clientId, userId);

    const template = await this.quoteTemplateService.findOne(
      templateId,
      userId,
    );


    const nextNumber = await this.getNextQuoteNumber(userId);

    const quote = await this.prisma.quote.create({
      data: {
        number: nextNumber,
        template: { connect: { id: templateId } },
        user: { connect: { id: userId } },
        client: { connect: { id: clientId } },
        status: QuoteStatus.draft,
        generatedHtml,
        validUntil: new Date(validUntil),
        issuedAt: null,
        variableValues: {
          create: this.mapVariableWithTemplateData(
            variableValues,
            template.variables,
            generatedHtml, // Pass the generated HTML here
          ),
        },
      },
      include: {
        variableValues: true,
      },
    });

    return plainToInstance(QuoteEntity, quote, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async findAll(userId: string) {
    const quotes = await this.prisma.quote.findMany({
      where: { userId },
      include: { variableValues: true },
    });

    return plainToInstance(QuoteEntity, quotes, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async findOne(id: string, userId: string) {
    const quote = await this.getQuoteOrThrow(id, userId);
    return plainToInstance(QuoteEntity, quote);
  }

  async update(id: string, userId: string, data: UpdateQuoteDto) {
    const { variableValues, ...otherData } = data;
    const existingQuote = await this.getQuoteOrThrow(id, userId);

    if (existingQuote.status !== QuoteStatus.draft) {
      throw new BadRequestException(
        'Seuls les devis en brouillon peuvent être modifiés.',
      );
    }

    for (const variable of variableValues ?? []) {
      await this.prisma.quoteVariableValue.update({
        where: {
          quoteId_variableName: {
            quoteId: id,
            variableName: variable.variableName,
          },
        },
        data: {
          value: variable.value,
        },
      });
    }

    const updatedQuote = await this.prisma.quote.update({
      where: { id },
      data: {
        ...otherData,
      },
      include: {
        variableValues: true,
      },
    });

    return plainToInstance(QuoteEntity, updatedQuote, {
      excludeExtraneousValues: true,
      enableImplicitConversion: true,
    });
  }

  async remove(id: string, userId: string) {
    await this.getQuoteOrThrow(id, userId);
    const deletedQuote = this.prisma.quote.delete({ where: { id } });

    return plainToInstance(QuoteEntity, deletedQuote);
  }

  async getNextQuoteNumber(userId: string) {
    return generateNextNumber('quote', userId);
  }

  async getQuoteOrThrow(id: string, userId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, userId },
      include: { variableValues: true },
    });
    if (!quote) {
      throw new NotFoundException('Devis non trouvé.');
    }
    return quote;
  }

  private mapVariableWithTemplateData(
    submittedVariables: CreateQuoteVariableValueDto[],
    templateVariables: QuoteTemplateVariableEntity[],
    templateHtml: string, // <-- Add this parameter
  ) {
    // Extract variable names from the template HTML
    const variableNamesInHtml = extractVariablesFromHtml(templateHtml);

    // Only keep template variables that are actually present in the HTML
    const templateVariableMap = new Map(
      templateVariables
        .filter(variable => variableNamesInHtml.includes(variable.variableName))
        .map(variable => [variable.variableName, variable]),
    );

    return submittedVariables
      .filter(sub => variableNamesInHtml.includes(sub.variableName)) // Only map variables present in HTML
      .map((sub) => {
        const templateVariable = templateVariableMap.get(sub.variableName);
        if (!templateVariable) {
          throw new Error(
            `Variable ${sub.variableName} non définie dans le template`,
          );
        }

        return {
          variableName: sub.variableName,
          value: sub.value,
          label: templateVariable.label,
          type: templateVariable.type as VariableType,
          required: templateVariable.required,
        };
      });
  }
}
