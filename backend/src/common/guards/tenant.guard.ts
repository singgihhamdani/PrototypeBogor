import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RoleCode, AuthUser } from '../types/auth.types';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      throw new ForbiddenException('Akses ditolak: User belum terautentikasi');
    }

    // Super Admin and Admin Bidang can access any tenant
    if (
      user.role?.code === RoleCode.SUPER_ADMIN ||
      user.role?.code === RoleCode.ADMIN_BIDANG ||
      user.role?.code === RoleCode.EKSEKUTIF
    ) {
      return true;
    }

    // For OPERATOR_BUJK, ensure they only access their own BUJK data
    if (user.role?.code === RoleCode.OPERATOR_BUJK) {
      if (!user.bujkId) {
        throw new ForbiddenException('Akses ditolak: Akun BUJK Anda belum terhubung dengan data Master BUJK');
      }

      // Check params, query, or body for bujkId
      const targetBujkId =
        request.params.bujkId ||
        request.params.id ||
        request.query.bujkId ||
        request.body?.bujkId;

      if (targetBujkId && targetBujkId !== user.bujkId) {
        throw new ForbiddenException('Akses ditolak: Anda hanya diizinkan mengelola data badan usaha milik Anda sendiri');
      }

      return true;
    }

    return true;
  }
}
