import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Le nom d\'utilisateur' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'L\'email de l\'utilisateur' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Le mot de passe de l\'utilisateur' })
  @MinLength(6)
  password: string;
}
