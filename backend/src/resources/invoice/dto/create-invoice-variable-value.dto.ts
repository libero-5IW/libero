import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateInvoiceVariableValueDto {
  @ApiProperty({ example: 'freelancer_name' })
  @IsString({
    message: 'Le nom de la variable doit être une chaîne de caractères.',
  })
  @IsNotEmpty({ message: 'Le nom de la variable est requis.' })
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: 'Le nom de variable doit être en snake_case ou camelCase.',
  })
  variableName: string;

  @ApiProperty({ example: 'Jean Dupont' })
  @IsString({ message: 'La valeur doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'La valeur de la variable est requise.' })
  value: string;
}
