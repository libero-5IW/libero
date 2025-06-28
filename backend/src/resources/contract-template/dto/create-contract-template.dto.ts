import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ContractTemplateVariableDto } from './contract-template-variable.dto';

export class CreateContractTemplateDto {
  @ApiProperty({ example: 'Contrat standard' })
  @IsString({
    message: 'Le nom du template doit être une chaîne de caractères.',
  })
  @IsNotEmpty({ message: 'Le nom ne peut pas être vide.' })
  name: string;

  @ApiProperty({
    example: '<h1>Bonjour {{clientName}}</h1><p>Détails du contrat...</p>',
  })
  @IsString({ message: 'Le contenu HTML doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le contenu HTML ne peut pas être vide.' })
  contentHtml: string;

  @ApiProperty({
    description: 'Variables personnalisées définies par le freelance',
    type: [ContractTemplateVariableDto],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Les variables doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => ContractTemplateVariableDto)
  variables?: ContractTemplateVariableDto[];
}
