import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
            permissions: {
              where: { isGranted: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role dengan ID ${id} tidak ditemukan`);
    }

    return role;
  }

  async getPermissions(roleId: string) {
    await this.findOne(roleId);

    return this.prisma.rolePermission.findMany({
      where: { roleId },
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  }

  async updatePermissions(
    roleId: string,
    permissions: Array<{ resource: string; action: string; isGranted: boolean }>,
  ) {
    const role = await this.findOne(roleId);

    // Super Admin permissions cannot be modified to avoid lockout
    if (role.code === 'SUPER_ADMIN') {
      throw new BadRequestException('Hak akses peran Super Admin dilindungi sistem dan tidak dapat diubah');
    }

    // Update in transaction
    await this.prisma.$transaction(
      permissions.map((p) =>
        this.prisma.rolePermission.upsert({
          where: {
            roleId_resource_action: {
              roleId,
              resource: p.resource.toUpperCase(),
              action: p.action.toUpperCase(),
            },
          },
          update: { isGranted: p.isGranted },
          create: {
            roleId,
            resource: p.resource.toUpperCase(),
            action: p.action.toUpperCase(),
            isGranted: p.isGranted,
          },
        }),
      ),
    );

    return {
      success: true,
      message: `Matriks hak akses untuk peran ${role.name} berhasil diperbarui`,
      updatedCount: permissions.length,
    };
  }
}
