import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class InvoiceVariableValueEntity {
  @ApiProperty({ example: 'variable_name' })
  @Expose()
  variableName: string;

  @ApiProperty({ example: 'Valeur de la variable' })
  @Expose()
  value: string;
}

export class InvoiceEntity {
  @ApiProperty({ example: 'f21796d5-e7e4-4d5c-8f47-48f6d7c4457b' })
  @Expose()
  id: string;

  @ApiProperty({ example: 1 })
  @Expose()
  number: number;

  @ApiProperty({ example: 'draft' })
  @Expose()
  status: string;

  @ApiProperty({ example: '<h1>Facture n°2024-001</h1>...' })
  @Expose()
  generatedHtml: string;

  @ApiProperty({ example: '2024-04-25T00:00:00Z' })
  @Expose()
  issuedAt: Date;

  @ApiProperty({ example: '2024-05-25T00:00:00Z' })
  @Expose()
  dueDate: Date;

  @ApiProperty({ example: 'e29a7ef2-9a01-4c3a-8b1f-fb1a74351d6f' })
  @Expose()
  templateId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  userId: string;

  @ApiProperty({ example: '456e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  clientId: string;

  @ApiProperty({ type: () => [InvoiceVariableValueEntity] })
  @Expose()
  @Type(() => InvoiceVariableValueEntity)
  variableValues: InvoiceVariableValueEntity[];

  @ApiProperty({ example: '2024-04-25T12:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2024-04-25T13:00:00Z' })
  @Expose()
  updatedAt: Date;
}
