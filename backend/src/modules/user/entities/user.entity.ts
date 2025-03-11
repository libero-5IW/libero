import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.enum';
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

  @ApiProperty({ example: 'hashedpassword', description: 'Mot de passe haché' })
  @Exclude()
  password: string;

  @ApiProperty({ example: 'USER', enum: Role })
  @Expose()
  role: Role;

  @ApiProperty({ example: '2025-03-10T12:34:56Z' })
  @Expose()
  createdAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
