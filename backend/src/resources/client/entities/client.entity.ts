import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ClientEntity {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174999' })
  @Expose()
  userId: string;

  @ApiProperty({ example: 'Alice' })
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @Expose()
  lastName: string;

  @ApiProperty({ example: 'alice.dupont@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: '+33612345678' })
  @Expose()
  phoneNumber: string;

  @ApiProperty({ example: '10 rue de Paris' })
  @Expose()
  addressLine: string;

  @ApiProperty({ example: '75001' })
  @Expose()
  postalCode: string;

  @ApiProperty({ example: 'Paris' })
  @Expose()
  city: string;

  @ApiProperty({ example: 'France' })
  @Expose()
  country: string;

  @ApiProperty({ example: '2025-04-26T12:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2025-04-26T12:30:00Z' })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ClientEntity>) {
    Object.assign(this, partial);
  }
}
