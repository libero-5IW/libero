import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInvoiceVariableValueDto } from './create-invoice-variable-value.dto';

export class CreateInvoiceDto {
  @ApiProperty({ example: '6f83c8cb-df23-4c2f-a7ab-fc6f2c4fd7d2' })
  @IsUUID('4', { message: "L'ID utilisateur doit être un UUID valide." })
  userId: string;

  @ApiProperty({ example: '6f83c8cb-df23-4c2f-a7ab-fc6f2c4fd7d2' })
  @IsUUID('4', { message: "L'ID client doit être un UUID valide." })
  clientId: string;

  @ApiProperty({
    example: 'd2f2bff0-8991-42a7-a7ab-c6f2c4fd7d2c',
  })
  @IsUUID('4', { message: "L'ID du template doit être un UUID valide." })
  templateId: string;

  @ApiPropertyOptional({
    example: 'b2e2332e-03f4-4ec0-98cf-e1d8f11d1234',
    description: 'ID du devis lié à cette facture',
  })
  @IsOptional()
  @IsUUID('4', { message: "L'ID du devis doit être un UUID valide." })
  quoteId?: string;

  @ApiProperty({ example: '<p>Voici la facture générée…</p>' })
  @IsString({ message: 'Le HTML généré doit être une chaîne de caractères.' })
  generatedHtml: string;

  @ApiProperty({ example: '2025-06-15T00:00:00.000Z' })
  @IsDateString({}, { message: 'La date d\'échéance doit être une date ISO valide.' })
  dueDate: Date;

  @ApiProperty({
    description: 'Valeurs des variables de la facture',
    type: [CreateInvoiceVariableValueDto],
  })
  @IsArray({ message: 'Les valeurs de variables doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceVariableValueDto)
  variableValues: CreateInvoiceVariableValueDto[];
}
