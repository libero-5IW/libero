import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { VariableType } from 'src/common/enums/variable-type.enum';

export class InvoiceVariableValueEntity {
  @ApiProperty({ example: 'variable_name' })
  @Expose()
  variableName: string;

  @ApiProperty({ example: 'Nom de la variable' })
  @Expose()
  label: string;

  @ApiProperty({ enum: VariableType, example: VariableType.NUMBER })
  @Expose()
  type: VariableType;

  @ApiProperty({ example: true })
  @Expose()
  required: boolean;

  @ApiProperty({ example: 'Valeur de la variable' })
  @Expose()
  value: string;
}
