import { PartialType } from '@nestjs/mapped-types';
import { CreateContractDto } from './create-contract.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { UpdateContractVariableValueDto } from './update-contract-variable-value.dto';
import { Type } from 'class-transformer';
import { ContractStatus } from '../enums/contract-status.enum';

export class UpdateContractDto extends PartialType(CreateContractDto) {
  @ApiPropertyOptional({ enum: ContractStatus, example: ContractStatus.signed })
  @IsOptional()
  @IsEnum(ContractStatus, {
    message: 'Le statut doit être valide (draft, sent, signed, cancelled).',
  })
  status?: ContractStatus;

  @ApiPropertyOptional({ example: '<p>HTML mis à jour</p>' })
  @IsOptional()
  @IsString({ message: 'Le HTML généré doit être une chaîne de caractères.' })
  generatedHtml?: string;

  @ApiPropertyOptional({ example: '2025-06-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: "La date d'émission doit être une date ISO." })
  issuedAt?: Date;

  @ApiPropertyOptional({ example: '2025-06-30T00:00:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: "La date d'échéance doit être une date ISO." })
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Variables mises à jour',
    type: [UpdateContractVariableValueDto],
  })
  @IsOptional()
  @IsArray({ message: 'Les valeurs de variables doivent être un tableau.' })
  @ValidateNested({ each: true })
  @Type(() => UpdateContractVariableValueDto)
  variableValues?: UpdateContractVariableValueDto[];
}
