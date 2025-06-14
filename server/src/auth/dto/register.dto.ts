import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RegisterDto {

  @ApiProperty({ description: 'L\'email de l\'utilisateur' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Le nom d\'utilisateur' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Le mot de passe de l\'utilisateur' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}