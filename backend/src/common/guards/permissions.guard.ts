import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, RequiredPermission } from '../decorators/permissions.decorator';
import { RoleCode, AuthUser } from '../types/auth.types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      throw new ForbiddenException('Akses ditolak: User belum terautentikasi');
    }

    // Super Admin has universal permission
    if (user.role?.code === RoleCode.SUPER_ADMIN) {
      return true;
    }

    const userPerms = user.permissions || [];
    const targetKey = `${requiredPermission.resource.toLowerCase()}:${requiredPermission.action.toLowerCase()}`;

    const isGranted =
      userPerms.includes('*:*') ||
      userPerms.includes(`${requiredPermission.resource.toLowerCase()}:*`) ||
      userPerms.includes(targetKey);

    if (!isGranted) {
      throw new ForbiddenException(
        `Akses ditolak: Anda tidak memiliki izin untuk aksi '${requiredPermission.action}' pada modul '${requiredPermission.resource}'`,
      );
    }

    return true;
  }
}
