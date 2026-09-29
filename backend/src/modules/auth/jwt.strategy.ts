import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload, AuthUser, RoleCode } from '../../common/types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'sijakon_super_secret_jwt_key_ta_2026_bogor_kab'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Sesi tidak valid atau akun dinonaktifkan');
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
