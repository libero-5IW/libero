import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ContractVariableValueEntity } from './contract-variable-value.entity';
import { ContractStatus } from '../enums/contract-status.enum';
import { IsEnum } from 'class-validator';

export class ContractEntity {
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

  @ApiProperty({ example: 42 })
  @Expose()
  number: number;

  @ApiProperty({ example: '789e1234-b12a-4d5e-8123-fef674f8348a' })
  @Expose()
  clientId: string;

  @ApiProperty({ example: 'sent' })
  @IsEnum(ContractStatus, {
    message:
      'Le statut doit être draft, sent, signed, declined, expired ou cancelled.',
  })
  @Expose()
  status: ContractStatus;

  @ApiProperty({
    example: '<p>Voici le contrat de mission pour le projet...</p>',
  })
  @Expose()
  generatedHtml: string;

  @ApiProperty({ example: '2025-06-20T15:30:00Z' })
  @Expose()
  issuedAt: Date;

  @ApiProperty({ example: '2025-07-20T23:59:59Z' })
  @Expose()
  validUntil: Date;

  @ApiProperty({ example: 'user@email.com/contracts/pdf/2025-06-20.pdf' })
  @Expose()
  pdfKey: string;

  @ApiProperty({
    example: 'user@email.com/contracts/preview/2025-06-20.preview.png',
  })
  @Expose()
  previewKey: string;

  @ApiProperty({
    example: 'user@email.com/contracts/pdf/2025-06-20.pdf',
  })
  @Expose()
  pdfUrl: string;

  @ApiProperty({
    example: 'user@email.com/contracts/preview/2025-06-20.preview.png',
  })
  @Expose()
  previewUrl: string;

  @ApiProperty({ example: '2025-06-19T10:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2025-06-19T10:00:00Z' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: () => [ContractVariableValueEntity] })
  @Expose()
  @Type(() => ContractVariableValueEntity)
  variableValues: ContractVariableValueEntity[];
}
