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
  @IsNotEmpty({ message: "L'email ne peut pas être vide." })
  @IsEmail({}, { message: 'Le mail doit être valide.' })
  email: string;

  @ApiProperty({ example: 'Bluz', required: false })
  @IsOptional()
  companyName?: string;

  @ApiProperty({ example: '14 avenue du moulin rouge' })
  @IsNotEmpty({ message: "L'adresse est requise." })
  addressLine: string;

  @ApiProperty({ example: '93420' })
  @IsNotEmpty({ message: 'Le code postal est requis.' })
  postalCode: string;

  @ApiProperty({ example: 'Villepinte' })
  @IsNotEmpty({ message: 'La ville est requise.' })
  city: string;

  @ApiProperty({ example: 'France' })
  @IsNotEmpty({ message: 'Le pays est requis.' })
  country: string;

  @ApiProperty({ example: 'SASU' })
  @IsNotEmpty({ message: 'Le statut légal est requis.' })
  legalStatus: string;

  @ApiProperty({ example: '12345678901234' })
  @IsNotEmpty({ message: 'Le numéro SIRET est requis.' })
  @Matches(/^\d{14}$/, {
    message: 'Le numéro SIRET doit contenir exactement 14 chiffres.',
  })
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
