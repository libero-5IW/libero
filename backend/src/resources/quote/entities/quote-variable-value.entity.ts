import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class QuoteVariableValueEntity {
  @ApiProperty({ example: 'bb82e27b-3c22-4706-bf77-c983f419ed5f' })
  @Expose()
  id: string;

  @ApiProperty({ example: '5d8e69a3-8a15-4f96-87fc-76390f7407b2' })
  @Expose()
  quoteId: string;

  @ApiProperty({ example: 'number_of_pages' })
  @Expose()
  variableName: string;

  @ApiProperty({ example: '5' })
  @Expose()
  value: string;
}
