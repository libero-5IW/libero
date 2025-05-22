import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { VariableType } from 'src/common/enums/variable-type.enum';

export class QuoteTemplateVariableDto {
  @ApiProperty({ example: 'project_title' })
  @IsString({
    message: 'Le nom de la variable doit être une chaîne de caractères.',
  })
  @IsNotEmpty({ message: 'Le nom interne de la variable est requis.' })
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: 'Le nom de variable doit être en camelCase ou snake_case.',
  })
  variableName: string;

  @ApiProperty({ example: 'Titre du projet' })
  @IsString({ message: 'Le label doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le label affiché est requis.' })
  label: string;

  @ApiProperty({
    example: VariableType.STRING,
    enum: VariableType,
    description:
      'Type de la variable : string, number, boolean, date, textarea, email ou url.',
  })
  @IsEnum(VariableType, {
    message: `Le type de variable doit être l’un des suivants : ${Object.values(VariableType).join(', ')}.`,
  })
  type: string;

  @ApiProperty({ example: true })
  @IsBoolean({
    message: 'La valeur "required" doit être un booléen (true ou false).',
  })
  required: boolean;
}
