import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class UserEntity {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'John' })
  @Expose()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Expose()
  lastName: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'Bluz' })
  @Expose()
  companyName: string;

  @ApiProperty({ example: '14 avenue du moulin rouge' })
  @Expose()
  addressLine: string;

  @ApiProperty({ example: '93420' })
  @Expose()
  postalCode: string;

  @ApiProperty({ example: 'Villepinte' })
  @Expose()
  city: string;

  @ApiProperty({ example: 'France' })
  @Expose()
  country: string;

  @ApiProperty({ example: 'SASU' })
  @Expose()
  legalStatus: string;

  @ApiProperty({ example: '12321432543456' })
  @Expose()
  siret: string;

  @ApiProperty({ example: 'BE0123456789' })
  @Expose()
  tvaNumber: string;

  @ApiProperty({ example: 'hashedpassword', description: 'Mot de passe haché' })
  @Exclude()
  password: string;

  @ApiProperty({ example: '2025-03-10T12:34:56Z' })
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
