import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'L\'email de l\'utilisateur' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Le mot de passe de l\'utilisateur' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
