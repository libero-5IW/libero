import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceDto } from './create-invoice.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsDateString, IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceVariableValueDto } from './invoice-variable-value.dto';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @ApiPropertyOptional({ example: 'f21796d5-e7e4-4d5c-8f47-48f6d7c4457b' })
  @IsOptional()
  @IsUUID('4', { message: "L'ID de la facture doit être un UUID valide." })
  id?: string;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsNumber({}, { message: 'Le numéro doit être un nombre.' })
  number?: number;

  @ApiPropertyOptional({ example: 'draft' })
  @IsOptional()
  @IsString({ message: 'Le statut doit être une chaîne de caractères.' })
  status?: string;

  @ApiPropertyOptional({ example: '<h1>Facture générée</h1>' })
  @IsOptional()
  @IsString({ message: 'Le HTML généré doit être une chaîne de caractères.' })
  generatedHtml?: string;

  @ApiPropertyOptional({ example: '2024-04-25T00:00:00Z' })
  @IsOptional()
  @IsDateString({}, { message: 'La date d\'émission doit être une date valide.' })
  issuedAt?: string;

  @ApiPropertyOptional({ example: '2024-05-25T00:00:00Z' })
  @IsOptional()
  @IsDateString({}, { message: 'La date d\'échéance doit être une date valide.' })
  dueDate?: string;

  @ApiPropertyOptional({ example: 'template-uuid-1234' })
  @IsOptional()
  @IsUUID('4', { message: "L'ID du template doit être un UUID valide." })
  templateId?: string;

  @ApiPropertyOptional({ example: 'user-uuid-5678' })
  @IsOptional()
  @IsUUID('4', { message: "L'ID utilisateur doit être un UUID valide." })
  userId?: string;

  @ApiPropertyOptional({ example: 'client-uuid-91011' })
  @IsOptional()
  @IsUUID('4', { message: "L'ID client doit être un UUID valide." })
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Liste des variables de la facture',
    type: [InvoiceVariableValueDto],
  })
  @IsOptional()
  @IsArray({ message: 'Les variables doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => InvoiceVariableValueDto)
  variableValues?: InvoiceVariableValueDto[];
}
