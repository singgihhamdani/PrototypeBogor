import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'superadmin',
    description: 'Username atau email akun dinas/mitra',
  })
  @IsNotEmpty({ message: 'Username atau email wajib diisi' })
  @IsString()
  identifier: string;

  @ApiProperty({
    example: 'Demo2026!',
    description: 'Kata sandi pengguna',
  })
  @IsNotEmpty({ message: 'Kata sandi wajib diisi' })
  @IsString()
  @MinLength(6, { message: 'Kata sandi minimal 6 karakter' })
  password: string;
}
