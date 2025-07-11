import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuoteVariableValueDto } from './create-quote-variable-value.dto';

export class CreateQuoteDto {
  @ApiProperty({ example: '6f83c8cb-df23-4c2f-a7ab-fc6f2c4fd7d2' })
  @IsUUID('4', { message: "L'ID utilisateur doit être un UUID valide." })
  userId: string;

  @ApiProperty({ example: '6f83c8cb-df23-4c2f-a7ab-fc6f2c4fd7d2' })
  @IsUUID('4', { message: "L'ID client doit être un UUID valide." })
  clientId: string;

  @ApiProperty({
    example: 'd2f2bff0-8991-42a7-a7ab-c6f2c4fd7d2c',
    required: false,
  })
  @IsUUID('4', { message: "L'ID du template doit être un UUID valide." })
  templateId: string;

  @ApiProperty({ example: '<p>Voici le devis généré…</p>' })
  @IsString({ message: 'Le HTML généré doit être une chaîne de caractères.' })
  generatedHtml: string;

  @ApiProperty({ example: '2025-06-15T00:00:00.000Z' })
  @IsDateString(
    {},
    {
      message: 'La date de validité doit être une date valide ISO.',
    },
  )
  validUntil: Date;

  @ApiProperty({
    description: 'Valeurs des variables du devis',
    type: [CreateQuoteVariableValueDto],
  })
  @IsArray({ message: 'Les valeurs de variables doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => CreateQuoteVariableValueDto)
  variableValues: CreateQuoteVariableValueDto[];
}
