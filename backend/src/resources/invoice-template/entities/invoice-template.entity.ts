import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { InvoiceTemplateVariableEntity } from './invoice-template-variable.entity';

export class InvoiceTemplateEntity {
  @ApiProperty({ example: 'e29a7ef2-9a01-4c3a-8b1f-fb1a74351d6f' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Modèle de facture standard' })
  @Expose()
  name: string;

  @ApiProperty({
    example:
      '<p>Bonjour {{client_name}}, voici votre facture numéro {{invoice_number}}...</p>',
  })
  @Expose()
  contentHtml: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  userId: string;

  @ApiProperty({ type: () => [InvoiceTemplateVariableEntity] })
  @Expose()
  @Type(() => InvoiceTemplateVariableEntity)
  variables: InvoiceTemplateVariableEntity[];

  @ApiProperty({ example: '2025-04-20T10:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2025-04-20T12:30:00Z' })
  @Expose()
  updatedAt: Date;
}
