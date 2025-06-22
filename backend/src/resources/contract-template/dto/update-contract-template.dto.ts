import { PartialType } from '@nestjs/mapped-types';
import { CreateContractTemplateDto } from './create-contract-template.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ContractTemplateVariableDto } from './contract-template-variable.dto';
import { Type } from 'class-transformer';

export class UpdateContractTemplateDto extends PartialType(
  CreateContractTemplateDto,
) {
  @ApiPropertyOptional({ example: 'Contrat modifié' })
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
    type: [ContractTemplateVariableDto],
  })
  @IsOptional()
  @IsArray({ message: 'Les variables doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => ContractTemplateVariableDto)
  variables?: ContractTemplateVariableDto[];
}
