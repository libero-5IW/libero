import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Role } from '../entities/role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty({ message: 'Le prénom ne peut pas être vide.' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty({ message: 'Le nom ne peut pas être vide.' })
  lastName: string;

  @ApiProperty({ example: 'johndoe@example.com' })
  @IsEmail({}, { message: 'Le prénom ne peut pas être vide.' })
  email: string;

  @ApiProperty({ example: 'USER', enum: Role })
  role: Role;

  @ApiProperty({ example: 'StrongPassword123!' })
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères.',
  })
  password: string;
}
