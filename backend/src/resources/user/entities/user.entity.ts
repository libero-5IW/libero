import { ApiProperty } from '@nestjs/swagger';
import { ResetTokenSource } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
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

  @IsOptional()
  @ApiProperty({ example: 'BE0123456789' })
  @Expose()
  tvaNumber?: string;

  @ApiProperty({ example: 'hashedpassword', description: 'Mot de passe haché' })
  @Exclude()
  password: string;

  @ApiProperty({ example: 'Asjeuu76....' })
  @Exclude()
  resetPasswordToken: string;

  @ApiProperty({ example: '2025-03-10T12:34:56Z' })
  @Exclude()
  resetPasswordTokenExpiry: Date;

  @ApiProperty({ example: 'Asjeuu76....' })
  @Exclude()
  lastPasswordUpdate: Date;

  @IsOptional()
  @ApiProperty({ example: 'reset' })
  @IsEnum(ResetTokenSource, {
    message: 'Le statut doit être RESET, LOCKED ou EXPIRED',
  })
  @Exclude()
  resetTokenSource?: ResetTokenSource;

  @ApiProperty({ example: '2025-03-10T12:34:56Z' })
  @Exclude()
  loginAttempts: number;

  @IsOptional()
  @ApiProperty({ example: '2025-03-10T12:34:56Z' })
  @Exclude()
  lockedUntil?: Date;

  @ApiProperty({ example: '2025-03-10T12:34:56Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: false,
    description: '2FA activé ?',
    default: false,
  })
  isTwoFactorEnabled: boolean;

  @ApiProperty({
    example: null,
    description: 'Secret 2FA (base32). Null si 2FA est désactivé.',
    nullable: true,
  })
  twoFactorSecret?: string | null;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
