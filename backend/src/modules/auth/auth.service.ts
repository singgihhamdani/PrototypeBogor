import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, AuthUser, RoleCode } from '../../common/types/auth.types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { identifier, password } = loginDto;
    const cleanId = identifier.trim().toLowerCase();

    // 1. Cari user berdasarkan username atau email
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanId, mode: 'insensitive' } },
          { email: { equals: cleanId, mode: 'insensitive' } },
        ],
      },
      include: {
        role: {
          include: {
            permissions: {
              where: { isGranted: true },
            },
          },
        },
        bujk: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Kombinasi nama pengguna/email atau kata sandi tidak valid');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akun Anda dinonaktifkan. Silakan hubungi Administrator');
    }

    // 2. Verifikasi Password dengan Argon2id
    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Kombinasi nama pengguna/email atau kata sandi tidak valid');
    }

    // 3. Format permissions
    const permissions =
      user.role.code === RoleCode.SUPER_ADMIN
        ? ['*:*']
        : user.role.permissions.map(
            (p) => `${p.resource.toLowerCase()}:${p.action.toLowerCase()}`,
          );

    // 4. Generate JWT
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role.code as RoleCode,
      bujkId: user.bujkId,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>(
        'REFRESH_TOKEN_SECRET',
        'sijakon_refresh_secret_key_ta_2026_dpu',
      ),
      expiresIn: '7d',
    });

    // 5. Update last login & catat audit log
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        module: 'AUTH',
        recordId: user.id,
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: userAgent || 'Unknown',
      },
    });

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: {
        id: user.role.id,
        code: user.role.code as RoleCode,
        name: user.role.name,
      },
      bujkId: user.bujkId,
      permissions,
    };

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: authUser,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>(
          'REFRESH_TOKEN_SECRET',
          'sijakon_refresh_secret_key_ta_2026_dpu',
        ),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          role: {
            include: {
              permissions: { where: { isGranted: true } },
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Token refresh tidak valid');
      }

      const permissions =
        user.role.code === RoleCode.SUPER_ADMIN
          ? ['*:*']
          : user.role.permissions.map(
              (p) => `${p.resource.toLowerCase()}:${p.action.toLowerCase()}`,
            );

      const newPayload: JwtPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role.code as RoleCode,
        bujkId: user.bujkId,
        permissions,
      };

      const newAccessToken = this.jwtService.sign(newPayload);

      return {
        accessToken: newAccessToken,
        expiresIn: 3600,
        tokenType: 'Bearer',
      };
    } catch {
      throw new UnauthorizedException('Sesi token berakhir. Silakan login kembali');
    }
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: { where: { isGranted: true } },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    const permissions =
      user.role.code === RoleCode.SUPER_ADMIN
        ? ['*:*']
        : user.role.permissions.map(
            (p) => `${p.resource.toLowerCase()}:${p.action.toLowerCase()}`,
          );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: {
        id: user.role.id,
        code: user.role.code as RoleCode,
        name: user.role.name,
      },
      bujkId: user.bujkId,
      permissions,
    };
  }
}
