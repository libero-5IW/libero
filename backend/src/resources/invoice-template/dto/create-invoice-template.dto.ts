import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceTemplateVariableDto } from './invoice-template-variable.dto';

export class CreateInvoiceTemplateDto {
  @ApiProperty({ example: 'Facture standard' })
  @IsString({
    message: 'Le nom du template doit être une chaîne de caractères.',
  })
  @IsNotEmpty({ message: 'Le nom ne peut pas être vide.' })
  name: string;

  @ApiProperty({
    example: '<h1>Bonjour {{clientName}}</h1><p>Détails de la facture...</p>',
  })
  @IsString({ message: 'Le contenu HTML doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le contenu HTML ne peut pas être vide.' })
  contentHtml: string;

  @ApiProperty({
    description: 'Variables personnalisées définies par le freelance',
    type: [InvoiceTemplateVariableDto],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Les variables doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => InvoiceTemplateVariableDto)
  variables?: InvoiceTemplateVariableDto[];
}
