import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'StrongPassword123!' })
  @IsString({ message: 'Le mot de passe est requis.' })
  @MinLength(12, {
    message: 'Le mot de passe doit contenir au moins 12 caractères.',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'Le mot de passe doit contenir au moins une lettre majuscule, une minuscule, un chiffre et un symbole.',
  })
  newPassword: string;
}
