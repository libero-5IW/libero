import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ContractTemplateVariableDto {
  @ApiProperty({ example: 'clientName' })
  @IsString({
    message: 'Le nom de la variable doit être une chaîne de caractères.',
  })
  @IsNotEmpty({ message: 'Le nom de la variable ne peut pas être vide.' })
  variableName: string;

  @ApiProperty({ example: 'Nom du client' })
  @IsString({
    message: 'Le label doit être une chaîne de caractères.',
  })
  @IsNotEmpty({ message: 'Le label ne peut pas être vide.' })
  label: string;

  @ApiProperty({ example: 'string' })
  @IsString({
    message: 'Le type doit être une chaîne de caractères.',
  })
  @IsNotEmpty({ message: 'Le type ne peut pas être vide.' })
  type: string;

  @ApiProperty({ example: true })
  @IsBoolean({ message: 'Le champ requis doit être un booléen.' })
  required: boolean;
}
