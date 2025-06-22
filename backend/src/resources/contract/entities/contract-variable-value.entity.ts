import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { VariableType } from 'src/common/enums/variable-type.enum';

export class ContractVariableValueEntity {
  @ApiProperty({ example: 'bb82e27b-3c22-4706-bf77-c983f419ed5f' })
  @Expose()
  id: string;

  @ApiProperty({ example: '5d8e69a3-8a15-4f96-87fc-76390f7407b2' })
  @Expose()
  contractId: string;

  @ApiProperty({ example: 'number_of_days' })
  @Expose()
  variableName: string;

  @ApiProperty({ example: 'Nombre de jours de mission' })
  @Expose()
  label: string;

  @ApiProperty({ enum: VariableType, example: VariableType.NUMBER })
  @Expose()
  type: VariableType;

  @ApiProperty({ example: true })
  @Expose()
  required: boolean;

  @ApiProperty({ example: '10' })
  @Expose()
  value: string;
}
