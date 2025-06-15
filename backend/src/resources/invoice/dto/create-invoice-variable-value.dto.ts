import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateInvoiceVariableValueDto {
  @ApiProperty({ example: 'clientName' })
  @IsString({
    message: 'Le nom de la variable doit être une chaîne de caractères.',
  })
  variableName: string;

  @ApiProperty({ example: 'Jean Dupont' })
  @IsString({
    message: 'La valeur de la variable doit être une chaîne de caractères.',
  })
  value: string;
}
