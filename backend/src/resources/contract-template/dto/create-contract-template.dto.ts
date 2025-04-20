import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({ example: '6f83c8cb-df23-4c2f-a7ab-fc6f2c4fd7d2' })
  @IsUUID('4', { message: "L'ID utilisateur doit être un UUID valide." })
  userId: string;

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
