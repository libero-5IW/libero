import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class InvoiceVariableValueEntity {
  @ApiProperty({ example: 'variable_name' })
  @Expose()
  variableName: string;

  @ApiProperty({ example: 'Valeur de la variable' })
  @Expose()
  value: string;
}
