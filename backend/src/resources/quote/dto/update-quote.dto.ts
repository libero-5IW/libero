import { PartialType } from '@nestjs/mapped-types';
import { CreateQuoteDto } from './create-quote.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { UpdateQuoteVariableValueDto } from './update-quote-variable-value.dto';
import { Type } from 'class-transformer';
import { QuoteStatus } from '../enums/quote-status.enum';

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
  @ApiPropertyOptional({ enum: QuoteStatus, example: QuoteStatus.accepted })
  @IsOptional()
  @IsEnum(QuoteStatus, {
    message: 'Le statut doit être valide (draft, sent, accepted, refused).',
  })
  status?: QuoteStatus;

  @ApiPropertyOptional({ example: '<p>HTML mis à jour</p>' })
  @IsOptional()
  @IsString({ message: 'Le HTML généré doit être une chaîne de caractères.' })
  generatedHtml?: string;

  @ApiPropertyOptional({ example: '2025-06-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: "La date d'émission doit être une date ISO." })
  issuedAt?: Date;

  @ApiPropertyOptional({ example: '2025-06-20T00:00:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: 'La date de validité doit être une date ISO.' })
  validUntil?: Date;

  @ApiPropertyOptional({
    description: 'Variables mises à jour',
    type: [UpdateQuoteVariableValueDto],
  })
  @IsOptional()
  @IsArray({ message: 'Les valeurs de variables doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => UpdateQuoteVariableValueDto)
  variableValues?: UpdateQuoteVariableValueDto[];
}
