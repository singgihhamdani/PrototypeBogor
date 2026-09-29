import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleCode, AuthUser } from '../types/auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleCode[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Akses ditolak: Data otentikasi peran tidak ditemukan');
    }

    // Super Admin has universal access
    if (user.role.code === RoleCode.SUPER_ADMIN) {
      return true;
    }

    const hasRole = requiredRoles.includes(user.role.code);
    if (!hasRole) {
      throw new ForbiddenException(
        `Akses ditolak: Peran ${user.role.name} tidak memiliki kewenangan mengakses resource ini`,
      );
    }

    return true;
  }
}
