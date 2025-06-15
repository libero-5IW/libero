import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceTemplateDto } from './create-invoice-template.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
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
