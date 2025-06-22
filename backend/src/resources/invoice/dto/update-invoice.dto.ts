import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceDto } from './create-invoice.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { UpdateInvoiceVariableValueDto } from './update-invoice-variable-value.dto';
import { Type } from 'class-transformer';
import { InvoiceStatus } from '../enums/invoice-status.enum';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @ApiPropertyOptional({ enum: InvoiceStatus, example: InvoiceStatus.paid })
  @IsOptional()
  @IsEnum(InvoiceStatus, {
    message: 'Le statut doit être valide (draft, sent, paid, overdue, cancelled).',
  })
  status?: InvoiceStatus;

  @ApiPropertyOptional({ example: '<p>HTML mis à jour</p>' })
  @IsOptional()
  @IsString({ message: 'Le HTML généré doit être une chaîne de caractères.' })
  generatedHtml?: string;

  @ApiPropertyOptional({ example: '2025-06-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: "La date d'émission doit être une date ISO." })
  issuedAt?: Date;

  @ApiPropertyOptional({ example: '2025-06-30T00:00:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: 'La date d\'échéance doit être une date ISO.' })
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Variables mises à jour',
    type: [UpdateInvoiceVariableValueDto],
  })
  @IsOptional()
  @IsArray({ message: 'Les valeurs de variables doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => UpdateInvoiceVariableValueDto)
  variableValues?: UpdateInvoiceVariableValueDto[];
}
