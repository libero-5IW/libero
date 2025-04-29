import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class InvoiceVariableValueDto {
  @ApiProperty({ example: 'freelancer_name' })
  @IsString({ message: 'Le nom de la variable doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le nom de la variable est requis.' })
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: 'Le nom de variable doit être en camelCase ou snake_case.',
  })
  variableName: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString({ message: 'La valeur doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'La valeur de la variable est requise.' })
  value: string;
}
