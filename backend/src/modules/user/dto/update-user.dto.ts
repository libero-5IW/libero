import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { Role } from '../entities/role.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
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
  @IsEmail({}, { message: 'Le prénom ne peut pas être vide.' })
  email?: string;

  @ApiPropertyOptional({ example: 'USER', enum: Role })
  @IsOptional()
  role: Role;

  @ApiPropertyOptional({ example: 'StrongPassword123!' })
  @IsOptional()
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères.',
  })
  password?: string;
}
