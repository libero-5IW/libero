import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { VariableType } from 'src/common/enums/variable-type.enum';

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

  @ApiProperty({
    enum: VariableType,
    example: VariableType.STRING,
    description:
      'Type de la variable : string, number, boolean, date, textarea, email, url',
  })
  @IsEnum(VariableType, {
    message: `Le type de variable doit être l’un des suivants : ${Object.values(VariableType).join(', ')}.`,
  })
  type: string;

  @ApiProperty({ example: true })
  @IsBoolean({ message: 'Le champ requis doit être un booléen.' })
  required: boolean;
}
