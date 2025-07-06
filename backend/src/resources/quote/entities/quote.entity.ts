import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { QuoteVariableValueEntity } from './quote-variable-value.entity';
import { IsEnum } from 'class-validator';
import { QuoteStatus } from '../enums/quote-status.enum';

export class QuoteEntity {
  @ApiProperty({ example: '5d8e69a3-8a15-4f96-87fc-76390f7407b2' })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'd8cf1d4a-9fa4-4560-b77f-15439a001f5b',
    required: false,
  })
  @Expose()
  templateId?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  userId: string;

  @ApiProperty({ example: '2' })
  @Expose()
  number: number;

  @ApiProperty({ example: '789e1234-b12a-4d5e-8123-fef674f8348a' })
  @Expose()
  clientId: string;

  @ApiProperty({ example: 'sent' })
  @IsEnum(QuoteStatus, {
    message: 'Le statut doit être draft, sent, accepted ou refused.',
  })
  @Expose()
  status: QuoteStatus;

  @ApiProperty({ example: '<p>Bonjour Jean, voici votre devis...</p>' })
  @Expose()
  generatedHtml: string;

  @ApiProperty({ example: '2025-03-26T15:30:00Z' })
  @Expose()
  issuedAt: Date;

  @ApiProperty({ example: '2025-04-10T23:59:59Z' })
  @Expose()
  validUntil: Date;

  @ApiProperty({ example: 'user@email.com/quotes/pdf/2025-06-20.pdf' })
  @Expose()
  pdfKey: string;

  @ApiProperty({
    example: 'user@email.com/quotes/preview/2025-06-20.preview.png',
  })
  @Expose()
  previewKey: string;

  @Expose()
  pdfUrl: string;

  @ApiProperty({
    example: 'user@email.com/quotes/preview/2025-06-20.preview.png',
  })
  @Expose()
  previewUrl: string;

  @ApiProperty({ example: '2025-03-26T15:30:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2025-03-26T15:30:00Z' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: () => [QuoteVariableValueEntity] })
  @Expose()
  @Type(() => QuoteVariableValueEntity)
  variableValues: QuoteVariableValueEntity[];
}
