import { PartialType } from '@nestjs/mapped-types';
import { CreateContractTemplateDto } from './create-contract-template.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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

  @ApiPropertyOptional({ example: '<p>Contenu HTML mis à jour</p>' })
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
    type: [ContractTemplateVariableDto],
  })
  @IsOptional()
  @IsArray({ message: 'Les variables doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => ContractTemplateVariableDto)
  variables?: ContractTemplateVariableDto[];
}
