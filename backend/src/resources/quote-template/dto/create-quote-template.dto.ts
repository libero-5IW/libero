import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuoteTemplateVariableDto } from './quote-template-variable.dto';
import { Type } from 'class-transformer';

export class CreateQuoteTemplateDto {
  @ApiProperty({ example: 'Devis standard' })
  @IsString({
    message: 'Le nom du template doit être une chaîne de caractères.',
  })
  @IsNotEmpty({ message: 'Le nom ne peut pas être vide.' })
  name: string;

  @ApiProperty({
    example: '<h1>Bonjour {{clientName}}</h1><p>Détails du devis...</p>',
  })
  @IsString({ message: 'Le contenu HTML doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le contenu HTML ne peut pas être vide.' })
  contentHtml: string;

  @ApiProperty({
    description: 'Variables personnalisées définies par le freelance',
    type: [QuoteTemplateVariableDto],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Les variables doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => QuoteTemplateVariableDto)
  variables?: QuoteTemplateVariableDto[];
}
