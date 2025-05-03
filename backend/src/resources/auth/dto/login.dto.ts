import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'L’email fourni n’est pas valide.' })
  email: string;

  @IsString({
    message:
      'Le mot de passe est requis et doit être une chaîne de caractères.',
  })
  password: string;
}
