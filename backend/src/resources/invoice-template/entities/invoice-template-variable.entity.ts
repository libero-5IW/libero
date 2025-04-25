import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class InvoiceTemplateVariableEntity {
  @ApiProperty({ example: 'f21796d5-e7e4-4d5c-8f47-48f6d7c4457b' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'e29a7ef2-9a01-4c3a-8b1f-fb1a74351d6f' })
  @Expose()
  templateId: string;

  @ApiProperty({ example: 'invoice_number' })
  @Expose()
  variableName: string;

  @ApiProperty({ example: 'Numéro de facture' })
  @Expose()
  label: string;

  @ApiProperty({ example: 'number' })
  @Expose()
  type: string;

  @ApiProperty({ example: true })
  @Expose()
  required: boolean;
}
