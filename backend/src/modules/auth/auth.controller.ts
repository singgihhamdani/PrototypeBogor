import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Headers,
  Ip,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth.types';

@ApiTags('Autentikasi & Sesi')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Masuk ke sistem SIJAKON BOGOR',
    description:
      'Autentikasi kredensial pengguna (Super Admin, Admin Bidang, Eksekutif, Operator BUJK, Peserta TKK). Menghasilkan token JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login berhasil, mengembalikan accessToken dan data pengguna.',
  })
  @ApiResponse({
    status: 401,
    description: 'Kredensial username/email atau kata sandi tidak valid.',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(loginDto, ip, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Perbarui Token Akses (Refresh Token Rotation)',
    description: 'Menukar refreshToken yang masih berlaku dengan accessToken baru.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
      },
      required: ['refreshToken'],
    },
  })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Profil Pengguna Aktif & Izin Akses',
    description:
      'Mengambil profil lengkap pengguna yang sedang login beserta daftar hak akses granularnya.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil pengguna berhasil diambil.',
  })
  async getMe(@CurrentUser() user: AuthUser) {
    return this.authService.getMe(user.id);
  }
}
