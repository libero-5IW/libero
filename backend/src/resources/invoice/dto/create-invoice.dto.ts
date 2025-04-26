import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsObject, IsDateString } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'e29a7ef2-9a01-4c3a-8b1f-fb1a74351d6f' })
  @IsUUID()
  templateId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ example: '321e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: {
      invoice_number: '2024-001',
      issue_date: '2024-04-25',
      due_date: '2024-05-25',
      freelancer_address: '12 rue de Paris',
      freelancer_siret: '12345678900011',
      client_address: '34 avenue des Champs',
      prestation_description: 'Développement site web',
      total_amount: '1500',
      late_penalty: '10%',
      payment_terms: '30 jours',
      tva_detail: 'TVA non applicable, art. 293B du CGI'
    }
  })
  @IsObject()
  variables: Record<string, string>;

  @ApiProperty({ example: '2024-04-25T00:00:00Z' })
  @IsDateString()
  issuedAt: string;

  @ApiProperty({ example: '2024-05-25T00:00:00Z' })
  @IsDateString()
  dueDate: string;
}
