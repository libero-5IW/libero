import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceTemplateDto } from './create-invoice-template.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { InvoiceTemplateVariableDto } from './invoice-template-variable.dto';
import { Type } from 'class-transformer';

export class UpdateInvoiceTemplateDto extends PartialType(
  CreateInvoiceTemplateDto,
) {
  @ApiPropertyOptional({ example: 'Facture modifiée' })
  @IsOptional()
  @IsString({
    message: 'Le nom du template doit être une chaîne de caractères.',
  })
  @IsNotEmpty({ message: 'Le nom ne peut pas être vide.' })
  name?: string;

  @ApiPropertyOptional({ example: '<p>Contenu mis à jour</p>' })
  @IsOptional()
  @IsString({ message: 'Le contenu HTML doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le contenu HTML ne peut pas être vide.' })
  contentHtml?: string;

  @ApiPropertyOptional({ example: '6f83c8cb-df23-4c2f-a7ab-fc6f2c4fd7d2' })
  @IsOptional()
  @IsUUID('4', { message: "L'ID utilisateur doit être un UUID valide." })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Variables à remplacer dans le template',
    type: [InvoiceTemplateVariableDto],
  })
  @IsOptional()
  @IsArray({ message: 'Les variables doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => InvoiceTemplateVariableDto)
  variables?: InvoiceTemplateVariableDto[];
}
