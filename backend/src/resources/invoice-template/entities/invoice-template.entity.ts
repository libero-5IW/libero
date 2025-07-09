import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { InvoiceTemplateVariableEntity } from './invoice-template-variable.entity';

export class InvoiceTemplateEntity {
  @ApiProperty({ example: 'd8cf1d4a-9fa4-4560-b77f-15439a001f5b' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Modèle de facture pour prestation web' })
  @Expose()
  name: string;

  @ApiProperty({
    example:
      '<p>Bonjour {{client_name}}, voici votre facture pour {{prestation}}...</p>',
  })
  @Expose()
  contentHtml: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  userId?: string;

  @ApiProperty({ type: () => [InvoiceTemplateVariableEntity] })
  @Expose()
  @Type(() => InvoiceTemplateVariableEntity)
  variables: InvoiceTemplateVariableEntity[];

  @ApiProperty({
    example: 'user@email.com/invoice-templates/pdf/2025-06-20.pdf',
  })
  @Expose()
  pdfKey: string;

  @ApiProperty({
    example: 'user@email.com/invoice-templates/preview/2025-06-20.preview.png',
  })
  @Expose()
  previewKey: string;

  @Expose()
  pdfUrl?: string;

  @ApiProperty({
    example: 'user@email.com/invoice-templates/preview/2025-06-20.preview.png',
  })
  @Expose()
  previewUrl?: string;

  @ApiProperty({ example: '2025-03-26T15:30:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2025-03-27T10:45:00Z' })
  @Expose()
  updatedAt: Date;
}
