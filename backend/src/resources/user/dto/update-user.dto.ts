import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsNotEmpty({ message: 'Le prénom ne peut pas être vide.' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsNotEmpty({ message: 'Le nom ne peut pas être vide.' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'johndoe@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Le mail doit être valide.' })
  email?: string;

  @ApiPropertyOptional({ example: 'Bluz' })
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ example: '14 avenue du moulin rouge' })
  @IsOptional()
  addressLine?: string;

  @ApiPropertyOptional({ example: '93420' })
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({ example: 'Villepinte' })
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'France' })
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 'SASU' })
  @IsOptional()
  legalStatus?: string;

  @ApiPropertyOptional({ example: '12345678901234' })
  @IsOptional()
  siret?: string;

  @ApiPropertyOptional({ example: 'FR12345678901' })
  @IsOptional()
  tvaNumber?: string;
}
