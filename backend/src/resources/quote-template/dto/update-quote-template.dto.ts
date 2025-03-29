import { PartialType } from '@nestjs/mapped-types';
import { CreateQuoteTemplateDto } from './create-quote-template.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { QuoteTemplateVariableDto } from './quote-template-variable.dto';
import { Type } from 'class-transformer';

export class UpdateQuoteTemplateDto extends PartialType(
  CreateQuoteTemplateDto,
) {
  @ApiPropertyOptional({ example: 'Devis modifié' })
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
    type: [QuoteTemplateVariableDto],
  })
  @IsOptional()
  @IsArray({ message: 'Les variables doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => QuoteTemplateVariableDto)
  variables?: QuoteTemplateVariableDto[];
}
