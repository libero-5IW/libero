import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty({ message: 'Le prénom ne peut pas être vide.' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty({ message: 'Le nom ne peut pas être vide.' })
  lastName: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  @IsEmail({}, { message: 'Le mail doit être valide.' })
  email: string;

  @ApiProperty({ example: 'Bluz', required: false })
  @IsOptional()
  companyName?: string;

  @ApiProperty({ example: '14 avenue du moulin rouge' })
  @IsNotEmpty()
  addressLine: string;

  @ApiProperty({ example: '93420' })
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({ example: 'Villepinte' })
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'France' })
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'SASU' })
  @IsNotEmpty()
  legalStatus: string;

  @ApiProperty({ example: '12345678901234' })
  @IsNotEmpty()
  siret: string;

  @ApiProperty({ example: 'FR12345678901', required: false })
  @IsOptional()
  tvaNumber?: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString({ message: 'Le mot de passe est requis.' })
  @MinLength(12, {
    message: 'Le mot de passe doit contenir au moins 12 caractères.',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'Le mot de passe doit contenir au moins une lettre majuscule, une minuscule, un chiffre et un symbole.',
  })
  password: string;
}
