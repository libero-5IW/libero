import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class InvoiceTemplateVariableDto {
  @ApiProperty({ example: 'invoice_number' })
  @IsString({
    message: 'Le nom de la variable doit être une chaîne de caractères.',
  })
  @IsNotEmpty({ message: 'Le nom interne de la variable est requis.' })
  @Matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
    message: 'Le nom de variable doit être en camelCase ou snake_case.',
  })
  variableName: string;

  @ApiProperty({ example: 'Numéro de facture' })
  @IsString({ message: 'Le label doit être une chaîne de caractères.' })
  @IsNotEmpty({ message: 'Le label affiché est requis.' })
  label: string;

  @ApiProperty({
    example: 'string',
    enum: ['string', 'number', 'date', 'boolean'],
  })
  @IsString({ message: 'Le type doit être une chaîne de caractères.' })
  @IsIn(['string', 'number', 'date', 'boolean'], {
    message: 'Le type doit être string, number, date ou boolean.',
  })
  type: string;

  @ApiProperty({ example: true })
  @IsBoolean({
    message: 'La valeur "required" doit être un booléen (true ou false).',
  })
  required: boolean;
}
